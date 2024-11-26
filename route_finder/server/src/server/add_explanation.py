import json
import logging
import os
import textwrap
from typing import Any

import google.generativeai as genai


logger = logging.getLogger(__name__)

# configure google api
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
model = genai.GenerativeModel('gemini-pro')

MAX_RETRY_COUNT = 5


def add_explanation(
    preference: str, routes_geojson: Any, landmarks_geojson: Any
) -> dict[str, Any]:
    # generate prompt
    prompt: str = textwrap.dedent(
        f"""
        次の 1 つ目の JSON データを読み込んで、そのデータが示すルートの特徴を説明する文章を生成してください。
        # 出力する項目
        - title
        - description
        - details
        # 出力する項目に関する情報
        - title: ルート全体の特徴を踏まえたルートのタイトル
        - description: ルート全体の特徴の説明文
        - details: ルート中の特に '{preference}' の観点に適した見どころの場所の名前 (name) とその特徴の説明文 (description), 緯度 (latitude) と経度 (longitude) (最大 3 つ)
        # ルール
        - details は、2 つ目の JSON データが渡される場合は、その JSON データを元に抽出すること。JSON データが 1 つしか渡されない場合は、1 つ目の JSON データを元に抽出すること。
        - 出力は次の出力例のように JSON 形式で出力すること。
        # 出力例
        例 1. {{
            "title": "緑を感じる散歩ルート",
            "description": "緑が多く、自然との触れ合いを感じるルートです。人通や交通量が少なく、静かな時間を過ごすことができます。リフレッシュには最適です。",
            "details": [
                {{"name": "昭和記念公園", "description": "緑が多く、自然との触れ合いを感じる公園です。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "皇居外苑", "description": "緑が多く、自然との触れ合いを感じる小道です。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "六義園", "description": "緑が多く、自然との触れ合いを感じる広場です。", "latitude": 35.681236, "longitude": 139.767125}},
            ]
        }}
        例 2. {{
            "title": "浅草寺までの最短ルート",
            "description": "浅草寺までの最短ルートです。道中、狭く暗い道もありますので、利用する場合は注意してください。",
            "details": [
                {{"name": "浅草寺", "description": "歴史的な寺院です。常に多くの観光客で賑わっています。", "latitude": 35.681236, "longitude": 139.767125}},
            ]
        }}
        例 3. {{
            "title": "川口駅までの最も楽しいルート",
            "description": "川口駅までの最も楽しいルートです。道中には多くの飲食店やカフェがあり、おすすめです。",
            "details": [
                {{"name": "川口駅", "description": "駅前には多くの飲食店やカフェがあり、おすすめです。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "川口駅前商店街", "description": "様々な種類のお店が並び、飽きることなく楽しめます。", "latitude": 35.681236, "longitude": 139.767125}},
            ]
        }}
        # JSON データ 1
        {json.dumps(routes_geojson)}
        # JSON データ 2
        {json.dumps(landmarks_geojson)}
        """
    )

    for retry_count in range(MAX_RETRY_COUNT):
        try:
            response = model.generate_content(prompt)
            explained_info: dict[str, Any] = json.loads(response.text)

            if (
                "title" not in explained_info or
                "description" not in explained_info or
                "details" not in explained_info
            ):
                raise Exception("Invalid explanation format.")

            return explained_info
        except Exception as e:
            logger.error(f"Failed to add explanation. {e=}")
            if retry_count >= MAX_RETRY_COUNT:
                raise e


if __name__ == "__main__":
    # read .geojson file
    with open('route.geojson', 'r') as f:
        data_geojson: Any = json.load(f)

    # parse data to string
    data_geojson_str: str = json.dumps(data_geojson)

    res = add_explanation("緑が多い", data_geojson_str)
    logger.error(res)
