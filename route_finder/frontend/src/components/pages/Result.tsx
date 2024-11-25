import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import SearchInput from "@/components/ui/SearchInput";
import { useLocation } from "react-router-dom";
import { parseResponse, SearchResponse } from "@/lib/SearchResponse";
import { RouteMap } from "../ui/RouteMap";

function buildDefaultResponse(): SearchResponse {
  return {
    request: {
      query: "Mostly shaded route to the nearest park",
      startLocation: { latitude: 35.6895, longitude: 139.6917 },
      endLocation: { latitude: 35.6895, longitude: 139.6917 },
    },
    paragraphs: [
      "We found some routes that match your preference.",
      "The following is the best route we found for you.",
    ],
    routes: [
      {
        title: "Shaded route with greenery",
        description:
          "Much greenery on this route, and you can see shading by the greeneries. XXXXXXX",
        paths: [
          { latitude: 35.5974952, longitude: 139.7859834 },
          { latitude: 35.7974952, longitude: 139.7859834 },
          { latitude: 35.7974952, longitude: 139.7859834 },
          { latitude: 35.6974952, longitude: 139.7859834 },
        ],
        places: [
          {
            name: "Your current location",
            description: "Start point: Your current location",
            location: { latitude: 35.5974952, longitude: 139.7859834 },
          },
          {
            name: "Greenery area",
            description:
              "Waypoint 1: Greenery area. In fall, you can see red leaves.",
            location: { latitude: 35.7974952, longitude: 139.7859834 },
          },
          {
            name: "Good view of the park",
            description: "Waypoint 2: Good view of the park",
            location: { latitude: 35.7974952, longitude: 139.7859834 },
          },
          {
            name: "Ryuhoku Park",
            description: "Goal: The nearest park, Ryuhoku Park",
            location: { latitude: 35.6974952, longitude: 139.7859834 },
          },
        ],
        distanceInMeter: 1200,
        walkingDurationInMinutes: 15,
      },
    ],
  };
}

function Result(): JSX.Element {
  const location = useLocation();
  const state = location.state as any;
  const searchResponse = parseResponse(state) ?? buildDefaultResponse();
  console.log(searchResponse);

  const [selectedRoute] = useState(
    searchResponse.routes.length > 0 ? searchResponse.routes[0] : null
  );

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="flex flex-col w-[640px]">
          <p>
            Result for:
            <span className="font-medium pl-2">
              {searchResponse.request.query}
            </span>
          </p>
          <div className="pt-4 text-lg max-w-xl font-light">
            {searchResponse.paragraphs.map((paragraph) => (
              <p>{paragraph}</p>
            ))}
          </div>
          {/* Main result area */}
          {selectedRoute === null ? (
            <div className="pt-4">
              <p>No route found.</p>
            </div>
          ) : (
            <div className="pt-8">
              <div className="text-lg font-medium">{selectedRoute.title}</div>
              <div className="">{selectedRoute.description}</div>
              <div className="pt-4">
                <RouteMap route={selectedRoute} />
              </div>
            </div>
          )}

          {/* Other candidates */}
          <div className="pt-8">
            <div>Other route candidates:</div>
            <Carousel
              opts={{ align: "start" }}
              className="w-full max-w-lg pt-2"
            >
              <CarouselContent>
                <CarouselItem className="lg:basis-1/2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem className="lg:basis-1/2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem className="lg:basis-1/2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shaded route with greenery</CardTitle>
                    </CardHeader>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {/* Explore more */}
          <div className="pt-4 w-[240pt]">
            <div>Explore more:</div>
            <SearchInput placeholder="Search for more routes" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
