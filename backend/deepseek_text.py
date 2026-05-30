import json
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

from copy_presets import get_platform_profile, get_tone_profile


load_dotenv(dotenv_path=Path(__file__).with_name(".env"))


def _get_client() -> OpenAI:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise ValueError("缺少 DEEPSEEK_API_KEY，请在 backend/.env 中配置")

    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    return OpenAI(api_key=api_key, base_url=base_url)


def generate_product_copy(
    product_name: str,
    product_info: str,
    target_platform: str = "淘宝/拼多多",
    tone: str = "专业、清晰、有购买欲",
    language: str = "中文",
) -> dict:
    model = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash")
    client = _get_client()
    platform_profile = get_platform_profile(target_platform)
    tone_profile = get_tone_profile(tone)

    system_prompt = """
你是一个专业的电商运营文案助手。
你必须只输出 JSON，不要输出 Markdown，不要输出解释文字。
JSON 必须包含以下字段：
title: 商品标题
selling_points: 卖点列表，数组格式
description: 商品详情页文案
keywords: 搜索关键词列表
short_video_script: 80字以内短视频口播文案
"""

    user_prompt = f"""
请根据下面商品信息生成电商文案。

商品名称：{product_name}
商品信息：{product_info}
目标平台：{target_platform}
文案语气：{tone}
输出语言：{language}

目标平台风格规则：{platform_profile}
文案语气风格规则：{tone_profile}

要求：
1. 标题适合电商平台搜索。
2. 卖点要具体，不要空话。
3. 详情页文案要能直接复制使用。
4. 关键词要适合搜索和上架。
5. 短视频口播文案控制在 80 字以内。
"""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or ""

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "raw": content,
            "warning": "模型没有返回标准 JSON",
        }
