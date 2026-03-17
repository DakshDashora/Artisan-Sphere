from dotenv import load_dotenv
from groq import AsyncGroq
import os

load_dotenv()
# 1. Initialize the Groq Client
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# 2. Define your models
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct" # For your /generate-description image routing
TEXT_MODEL = "llama-3.3-70b-versatile"        # For your /story standard text generation

async def generate_text(prompt: str) -> str:
    """Handles standard text generation (like the Q&A loop)"""
    response = await groq_client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800
    )
    return response.choices[0].message.content.strip()

async def generate_with_image(prompt: str, image_url: str) -> str:
    """Handles multimodal generation (like the product descriptions)"""
    response = await groq_client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ],
        max_tokens=300
    )
    return response.choices[0].message.content.strip()