import json
import re

from app.services.llm_services import generate_text

def split_responses(text: str):
    """Parse the LLM output into a list of exactly 3 description strings.

    The model is asked to return a JSON array of 3 strings. We try to parse
    that first (extracting the array even if wrapped in stray text/markdown),
    then fall back to blank-line splitting if JSON parsing fails.
    """
    if not text:
        return []

    cleaned = text.strip()
    # Strip markdown code fences if the model wrapped the JSON in them.
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned).strip()

    # Try to locate and parse a JSON array anywhere in the response.
    match = re.search(r"\[.*\]", cleaned, flags=re.DOTALL)
    if match:
        try:
            parsed = json.loads(match.group(0))
            if isinstance(parsed, list):
                items = [str(p).strip() for p in parsed if str(p).strip()]
                if items:
                    return items[:3]
        except json.JSONDecodeError:
            pass

    # Fallback: split on blank lines (legacy behaviour).
    parts = [p.strip() for p in cleaned.split("\n\n") if p.strip()]
    return parts[:3]

def toString(history: dict)->str:
    history_text = ""
    for i, qa in enumerate(history, 1):
        question = qa["q"]
        answer = qa.get("a", "…")
        history_text += f"{i}. Q: {question}\n   A: {answer}\n"
    return history_text

async def translate_helper(text: str, target_language: str) -> str:
    if not text or not text.strip():
        return ""
    try:
        target_lang_clean = target_language.strip().lower()
        if "hindi" in target_lang_clean or "hi" == target_lang_clean:
            lang_instruction = (
                "Translate the following text into natural, fluent Hindi using the Devanagari script. "
                "Output ONLY the Hindi translation. Do not include explanations, notes, or English words."
            )
        else:
            lang_instruction = f"Translate the following text into {target_language}. Respond ONLY with the translated text. Do not include any quotes, markdown formatting, or conversational filler."

        prompt = (
            f"{lang_instruction}\n\n"
            f"Text to translate: {text}"
        )
        translated_text = await generate_text(prompt, max_tokens=300)
        # Clean quotes if model wrapped it
        clean_text = translated_text.strip()
        if clean_text.startswith('"') and clean_text.endswith('"'):
            clean_text = clean_text[1:-1].strip()
        elif clean_text.startswith("'") and clean_text.endswith("'"):
            clean_text = clean_text[1:-1].strip()
        return clean_text
    except Exception as e:
        print(f"Translation helper failed: {e}")
        return text


