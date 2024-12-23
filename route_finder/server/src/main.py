# Description: Main entry point for the server.
import dataclasses
import json
import logging
import os
from typing import Any

from dotenv import load_dotenv
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from geojson_length import calculate_distance, Unit

from constants import WEIGHT_LANDMARKS
from request_response_data import SearchRequest, Location, SearchResponse, Route, Place
from server.add_explanation import add_explanation
from server.calculate_weights import calc_weights
from server.extract_landmarks import extract_landmarks
from server.generate_description import generate_description
from server.get_routes import get_routes


load_dotenv()

DB_USER: str = os.environ["DB_USER"]
DB_PASSWORD: str = os.environ["DB_PASSWORD"]
DB_HOST: str | None = os.getenv("DB_HOST")
DB_PORT: str | None = os.getenv("DB_PORT")
DB_INSTANCE_CONNECTION_NAME: str | None = os.getenv("DB_INSTANCE_CONNECTION_NAME")
DB_NAME: str = os.environ["DB_NAME"]

_HTTP_400_BAD_REQUEST: int = 400

logger: logging.Logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="dist", static_url_path="")

if app.debug:
    logger.error("debug mode")
    # Allow CORS from the React app running in development mode.
    CORS(app)
    db_url = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
else:
    db_url = f'postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@/{DB_NAME}?unix_sock=/cloudsql/{DB_INSTANCE_CONNECTION_NAME}/.s.PGSQL.5432'

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
db = SQLAlchemy(app)


@app.route("/")
def server():
    """Serves the React files."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/search")
def search():
    """Search API endpoint."""
    logger.error(f"[{__name__}] process started.")

    preference: str | None = request.args.get("q")
    start_location: str | None = request.args.get("s")
    end_location: str | None = request.args.get("e")
    # Delay seconds for emulating server delay.
    delay: str | None = request.args.get("delay")
    logger.error(f"[{__name__}] request: {preference=}, {start_location=}, {end_location=}")

    # Validate the request.
    if not preference or not start_location or not end_location:
        return (
            jsonify({"error": "Missing preference, start, or end location."}),
            _HTTP_400_BAD_REQUEST,
        )

    start_loc_obj: Location | None = Location.from_str(start_location)
    end_loc_obj: Location | None = Location.from_str(end_location)
    if start_loc_obj is None or end_loc_obj is None:
        return (
            jsonify({"error": "Invalid start or end location."}),
            _HTTP_400_BAD_REQUEST,
        )

    req: SearchRequest | None = SearchRequest(
        preference, start_loc_obj, end_loc_obj
    )
    if req is None:
        return jsonify({"error": "Invalid request."}), _HTTP_400_BAD_REQUEST

    # calculate weights of variables
    weights: dict[str, float] = calc_weights(preference)
    logger.error(f"[{__name__}] {weights=}")

    # generate description
    description: str = generate_description(preference, weights)
    logger.error(f"[{__name__}] {description=}")

    # inference landmarks
    landmarks: list[str] = extract_landmarks(preference)
    logger.error(f"[{__name__}] {landmarks=}")

    # get info of routes and landmarks
    routes_info: str
    landmarks_info: str | None

    routes_info, landmarks_info = get_routes(
        db,
        start_lat=start_loc_obj.latitude,
        start_lon=start_loc_obj.longitude,
        end_lat=end_loc_obj.latitude,
        end_lon=end_loc_obj.longitude,
        weight_length=weights['weight_length'],
        weight_green_index=weights['weight_green_index'],
        weight_water_index=weights['weight_water_index'],
        weight_shade_index=weights['weight_shade_index'],
        weight_slope_index=weights['weight_slope_index'],
        weight_road_safety=weights['weight_road_safety'],
        weight_isolation=weights['weight_isolation'],
        weight_landmarks=WEIGHT_LANDMARKS,
        landmarks=landmarks,
    )
    routes_info_dict: dict[str, Any] = {
        "type": "Feature",
        "properties": {},
        "geometry": json.loads(routes_info)
    }

    # calculate
    # distance [meters]
    distance: float = calculate_distance(routes_info_dict, Unit.meters)
    logger.error(f"[{__name__}] {distance=}")
    # duration [minutes]
    duration: int = int(distance / 1.4 / 60)
    logger.error(f"[{__name__}] {duration=}")

    # add explanation
    explained_info: dict[str, Any] = add_explanation(preference, routes_info, landmarks_info)
    logger.error(f"[{__name__}] {explained_info=}")

    # generate response
    route: Route = Route(
        title=explained_info["title"],
        description=explained_info["summary"],
        paths=[],
        path_geo_json={
            "type": "FeatureCollection",
            "features": [routes_info_dict],
        },
        places=[
            Place(
                place.get("name", ""),
                place.get("description", ""),
                Location(place.get("latitude", 0), place.get("longitude", 0))
            ) for place in explained_info["details"]
        ],
        distance_in_meter=distance,
        walking_duration_in_minutes=duration,
    )
    response: SearchResponse = SearchResponse(
        request=req,
        paragraphs=[description],
        routes=[route],
    )
    logger.error(f"[{__name__}] {response=}")

    logger.error(f"[{__name__}] process completed.")
    return jsonify(dataclasses.asdict(response))


if __name__ == "__main__":
    app.run()
