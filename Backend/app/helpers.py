from app.services.llm_services import generate_text

def split_responses(text: str):
    # Split on **Option...** blocks
    parts = text.split("\n\n")
    parts = [p.strip() for p in parts if p.strip()]
    return parts

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
            lang_instruction = "Translate the following English text strictly into natural Hindi using the Devanagari script. Do not output English letters, Russian characters, Chinese characters, or any other script except Devanagari. Do not include any pronunciation guides, translator explanations, quotes, or conversational filler. Output ONLY the clean Hindi translation."
        else:
            lang_instruction = f"Translate the following text into {target_language}. Respond ONLY with the translated text. Do not include any quotes, markdown formatting, or conversational filler."

        prompt = (
            f"{lang_instruction}\n\n"
            f"Text to translate: {text}"
        )
        translated_text = await generate_text(prompt)
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


