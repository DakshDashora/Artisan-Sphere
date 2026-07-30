from dotenv import load_dotenv
from groq import AsyncGroq
import os
import re

load_dotenv()
# 1. Initialize the Groq Client
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# 2. Define your models
VISION_MODEL = "qwen/qwen3.6-27b"         # For your /generate-description image routing
TEXT_MODEL = "openai/gpt-oss-120b"        # For your /story standard text generation

def clean_think_tags(text: str) -> str:
    """Removes thinking process enclosed in <think>...</think> tags if present"""
    if not text:
        return ""
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r'<think>.*', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned_stripped = cleaned.strip()
    # Fallback to the original text if cleaning removes everything (e.g., truncated thinking)
    return cleaned_stripped if cleaned_stripped else text.strip()

async def _create(model: str, messages: list, max_tokens: int) -> str:
    """Call Groq, keeping any model 'reasoning' out of the returned content.

    Reasoning models (e.g. qwen3) emit a <think> block. reasoning_format='hidden'
    tells Groq to strip it server-side so it never leaks into message.content.
    We fall back gracefully if the model/endpoint doesn't accept the param.
    """
    kwargs = dict(model=model, messages=messages, max_tokens=max_tokens)
    try:
        response = await groq_client.chat.completions.create(
            reasoning_format="hidden", **kwargs
        )
    except Exception:
        # Older param name / unsupported model — retry without it, then clean tags.
        response = await groq_client.chat.completions.create(**kwargs)
    return clean_think_tags(response.choices[0].message.content)

async def generate_text(prompt: str) -> str:
    """Handles standard text generation (like the Q&A loop)"""
    return await _create(
        TEXT_MODEL,
        [{"role": "user", "content": prompt}],
        max_tokens=1500,
    )

async def generate_with_image(prompt: str, image_url: str) -> str:
    """Handles multimodal generation (like the product descriptions)"""
    return await _create(
        VISION_MODEL,
        [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
        max_tokens=2048,
    )