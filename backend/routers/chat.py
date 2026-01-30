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

from fastapi_limiter.depends import RateLimiter
import traceback

@router.post("/",dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def chat_answer(query:ChatQuery, request:Request):
    db = request.app.database
    latest_file = await db["files"].find_one(sort =[("_id",-1)])
    context = ""
    timestamp_segments = []
    file_type ="unknwown"

    if latest_file:
        context = latest_file.get("text","")
        timestamp_segments = latest_file.get("segments", [])
        file_type = latest_file.get("type","pdf")
    else:
        context= global_state.last_uploaded_text

    if not context:
        return {"answer": "I don't have any file context yet. Please upload a PDF, Audio, or Video file first."}
    
    answer=""
    timestamp_str = ""

    if settings.GROQ_API_KEY:
        try:
            print("ATTEMPTING GROQ LLM (Llama 3)...")
            from langchain_groq import ChatGroq
            from langchain_core.prompts import PromptTemplate

            llm = ChatGroq(temperature=0, model_name="llama-3.3-70b-versatile", groq_api_key=settings.GROQ_API_KEY)

            prompt = PromptTemplate(
                input_variables=["context","question"],
                template="You are a helpful assistant. Use the following context to answer the question briefly.\n\nContext:\n{context}\n\nQuestion: {question}\nAnswer:"
            )

            chain = prompt | llm
            safe_context = context[:25000]

            response = chain.invoke({"context": safe_context, "question": query.question})
            answer = response.content
            print("GROQ SUCCESS")

        except Exception as e:
            print(f"GROQ FAILED. SWITCHING TO OFFLINE MODE. Error: {e}")
            pass
    else:
        print("USING OFFLINE MODE (No Groq API Key Found)")

    question_tokens = query.question.lower().split()
    relevant_sentences = []
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', context)
    
    for sentence in sentences:
        score = sum(1 for token in question_tokens if token in sentence.lower())
        if score > 0:
            relevant_sentences.append((score, sentence))
    relevant_sentences.sort(key=lambda x: x[0], reverse=True)

    if relevant_sentences:
        best_sentence = relevant_sentences[0][1].strip() 
       
        if not answer:
            answer = f"Based on the file: \"{best_sentence}\""

        if file_type == 'audio' and timestamp_segments:
            for seg in timestamp_segments:

                if best_sentence[:20] in seg['text']: 
                    start_time = int(seg['start'])
                    minutes = start_time // 60
                    seconds = start_time % 60
                    timestamp_str = f" [{minutes:02}:{seconds:02}]"
                    break

    if not answer:
        answer = "I couldn't find a specific answer in the uploaded file, but I've processed its content. Try asking about specific keywords found in the document."

    return {"answer": f"{answer}{timestamp_str}"}
