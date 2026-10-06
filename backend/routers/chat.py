from fastapi import APIRouter, Depends
from utils import get_current_user
from pydantic import  BaseModel

router = APIRouter (dependencies=[Depends(get_current_user)])

class ChatQuery(BaseModel):
    question :str

from state import global_state
import re

from utils import Settings

settings = Settings()

from fastapi import Request

@router.post("/")
async def chat_answer(query:ChatQuery, request:Request, user: dict = Depends(get_current_user)):
    db = request.app.database
    user_email = user.get("email") or user.get("sub")
    
    # Fetch all files for this user
    user_files = await db["files"].find({"user_email": user_email}).to_list(length=50)
    
    if not user_files:
        return {"answer": "I don't have any file context yet. Please upload one or more files first."}

    # Construct combined context with timestamps for audio/video files
    combined_context = ""
    for f in user_files:
        filename = f.get("filename", "Unknown")
        segments = f.get("segments", [])
        if segments:
            timed_lines = []
            for seg in segments:
                start_sec = int(seg.get("start", 0))
                mins = start_sec // 60
                secs = start_sec % 60
                seg_text = seg.get("text", "").strip()
                if seg_text:
                    timed_lines.append(f"[{mins:02d}:{secs:02d}] {seg_text}")
            content_body = "\n".join(timed_lines)
        else:
            content_body = f.get("text", "")

        combined_context += f"--- DOCUMENT: {filename} ---\n{content_body}\n\n"

    answer = ""
    if settings.GROQ_API_KEY:
        try:
            print(f"ATTEMPTING GROQ LLM with {len(user_files)} documents...")
            from langchain_groq import ChatGroq
            from langchain_core.prompts import PromptTemplate

            primary_model = "openai/gpt-oss-120b"
            llm = ChatGroq(temperature=0, model_name=primary_model, groq_api_key=settings.GROQ_API_KEY)

            # Refined prompt for multi-document cross-referencing with timestamps
            template = """You are a highly capable AI assistant specializing in multi-document analysis and cross-referencing.
Your goal is to answer the user's question accurately based on the provided document contexts.

CRITICAL RULES:
1. When referencing, quoting, or summarizing audio/video files that contain timestamps like [MM:SS], you MUST include the exact clickable timestamp format [MM:SS] (e.g., [00:15], [01:23]) next to each point so the user can click to play that moment.
2. Explicitly cite which document you are referencing (e.g., "According to [Filename]...").
3. When multiple documents are present, compare and contrast information between them if relevant, and highlight any contradictions.
4. If the answer isn't in any document, say so.

Context:
{context}

Question: {question}
Answer:"""

            prompt = PromptTemplate(input_variables=["context","question"], template=template)
            chain = prompt | llm
            
            # Truncate context to stay within limits (roughly 25k chars)
            safe_context = combined_context[:25000]

            try:
                response = chain.invoke({"context": safe_context, "question": query.question})
                answer = response.content
                print("GROQ SUCCESS (Primary Model)")
            except Exception as primary_err:
                print(f"Primary model failed ({primary_err}), trying secondary model qwen/qwen3.8-27b...")
                fallback_llm = ChatGroq(temperature=0, model_name="qwen/qwen3.8-27b", groq_api_key=settings.GROQ_API_KEY)
                fallback_chain = prompt | fallback_llm
                response = fallback_chain.invoke({"context": safe_context, "question": query.question})
                answer = response.content
                print("GROQ SUCCESS (Fallback Model)")

        except Exception as e:
            print(f"GROQ FAILED. Error: {e}")
            answer = "I'm having trouble connecting to the AI service. Please try again later."
    else:
        # Fallback to simple keyword search across all documents
        question_tokens = query.question.lower().split()
        relevant_hits = []
        
        for f in user_files:
            text = f.get("text", "")
            filename = f.get("filename", "Unknown")
            sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', text)
            for sentence in sentences:
                score = sum(1 for token in question_tokens if token in sentence.lower())
                if score > 0:
                    relevant_hits.append((score, filename, sentence))
        
        relevant_hits.sort(key=lambda x: x[0], reverse=True)
        if relevant_hits:
            best = relevant_hits[0]
            answer = f"From {best[1]}: \"{best[2].strip()}\""
        else:
            answer = "I couldn't find a specific match in your documents. Try asking something more specific."

    return {"answer": answer}
