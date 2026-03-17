from fastapi import APIRouter, HTTPException
from typing import Dict
import uuid

# Import your custom schemas and utilities
from app.schemas import Product, ReturnDescriptionSchema, ReturnSessionSchema, QuizDoneSchema, Answer, TranslateRequest, TranslateResponse
from app.helpers import toString, split_responses
from app.prompts import imageDescriptionPrompt, nextQuestionPrompt, storyPrompt

# Import your new Groq LLM service
from app.services.llm_services import generate_text, generate_with_image

# Create a single unified router
router = APIRouter(prefix="/api", tags=["artisan_sphere"])

# ==========================================
# 1. GENERATE DESCRIPTION ROUTE
# ==========================================
@router.post("/generate-description", response_model=ReturnDescriptionSchema)
async def generate_description(product: Product):
    try:
        prompt = f"{imageDescriptionPrompt}\n\nProduct name: {product.title}"
        
        if product.image_url:
            # Pass the Cloudinary URL directly to Groq! No parsing needed.
            result_text = await generate_with_image(prompt, product.image_url)
        else:
            result_text = await generate_text(prompt)

        separated = split_responses(result_text)
    
        return ReturnDescriptionSchema(
            status=True,
            aiDescription=separated
        )

    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 2. STORY SESSION ROUTES
# ==========================================
# Simple in-memory session store
sessions: Dict[str, Dict] = {}

@router.post("/start-session", response_model=ReturnSessionSchema)
async def start_session(product: Product):
    session_id = str(uuid.uuid4())
    first_question = "Tell me about yourself as an artisan."

    sessions[session_id] = {
        "history": [{"q": first_question, "a": None}],
        "count": 0,
        "title": product.title,
        "image": product.image_url
    }
    
    print("Session created successfully:", session_id)
    return ReturnSessionSchema(
        sessionId=session_id,
        question=first_question
    )

@router.post("/answer", response_model=QuizDoneSchema)
async def submit_answer(data: Answer):
    session = sessions.get(data.session_id)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid session")

    # Normalize answer
    ans = (data.answer or "").strip()

    # Fill last unanswered question
    if session["history"] and session["history"][-1]["a"] is None:
        session["history"][-1]["a"] = ans
    else:
        raise HTTPException(status_code=400, detail="No pending question to answer")

    session["count"] += 1

    # Stop condition -> Generate final story
    if ans == "__STOP__" or session["count"] >= 10:
        history_text = toString(session["history"])
        story_prompt = storyPrompt(history_text, session["title"], session["image"])
        
        # Using the fast versatile text model for the story compilation
        story_text = await generate_text(story_prompt)
        print(story_text)
        
        return QuizDoneSchema(
            done=True,
            question=story_text
        )

    # Otherwise -> Generate next question
    history_text = toString(session["history"])
    prompt = nextQuestionPrompt(history_text, session["title"], session["image"])
    
    # Using the fast versatile text model for the Q&A loop
    next_q_text = await generate_text(prompt)
    print(next_q_text)
    
    session["history"].append({"q": next_q_text, "a": None})

    return QuizDoneSchema(
        done=False,
        question=next_q_text
    )


# ==========================================
# 3. TRANSLATE ROUTE
# ==========================================
@router.post("/translate", response_model=TranslateResponse)
async def translate_text(req: TranslateRequest):
    """
    Translate text into target language using Groq's Llama model instead of Google Cloud
    """
    try:
        # Create a strict system prompt so the LLM acts purely as a translator
        prompt = (
            f"You are a professional translator. Translate the following text into {req.target_language}. "
            "Respond ONLY with the translated text. Do not include any quotes, markdown formatting, "
            "or conversational filler.\n\n"
            f"Text to translate: {req.text}"
        )
        
        translated_text = await generate_text(prompt)
        
        return TranslateResponse(
            success=True,
            translated_text=translated_text
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))