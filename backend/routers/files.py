from fastapi import APIRouter, Depends, UploadFile, File,HTTPException, Request
from utils import get_current_user, Settings
import shutil
import os
import whisper
from tempfile import NamedTemporaryFile
from pypdf import PdfReader
from state import global_state

from typing import List

router = APIRouter(dependencies=[Depends(get_current_user)])
settings = Settings()

ffmpeg_dir = r"C:\Users\Devesh Kesharwani\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin"

if os.path.exists(ffmpeg_dir):
    os.environ["Path"] +=os.pathsep + ffmpeg_dir
    print(f"Injected FFmpeg path: {ffmpeg_dir}")

try:
    model = whisper.load_model("base")
except Exception as e:
    print(f"Warning: Could not load Whisper model: {e}")
    model = None

@router.get("/")
async def get_files(request: Request, user: dict = Depends(get_current_user)):
    db = request.app.database
    user_email = user.get("email")
    files = await db["files"].find({"user_email": user_email}).to_list(length=100)
    # Convert ObjectId to string for JSON serialization
    for f in files:
        f["_id"] = str(f["_id"])
    return files

@router.post("/upload")
async def upload_files(request : Request, files: List[UploadFile] = File(...), user: dict = Depends(get_current_user)):
    db= request.app.database
    user_email = user.get("email")
    results = []

    for file in files:
        filename = file.filename
        ext = os.path.splitext(filename)[1].lower()

        with NamedTemporaryFile(delete = False, suffix=ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            summary = "Summary generation pending..."
            transcription_text = ""
            segments = []
            
            if ext in ['.mp3', '.wav', '.mp4', '.m4a']:
                if model:
                    print(f"Transcribing file: {tmp_path}")
                    result = model.transcribe(tmp_path, fp16=False)
                    transcription_text = result["text"].strip()
                    segments = result.get("segments", [])
                    
                    if transcription_text:
                         summary = f"Transcription Preview: {transcription_text[:200]}..."
                    else:
                         summary = "Processed successfully, but no speech was detected."
                else:
                    summary = "Whisper model not loaded. Transcription failed."
            elif ext == '.pdf':
                reader = PdfReader(tmp_path)
                full_text = ""
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                
                transcription_text = full_text
                summary = f"PDF Content Preview: {full_text[:300]}..."
            elif ext == '.txt':
                with open(tmp_path, 'r', encoding='utf-8') as f:
                    transcription_text = f.read()
                summary = f"Text Content Preview: {transcription_text[:300]}..."
            else:
                 summary = "Unsupported file type for auto-processing."

            file_doc = {
                "filename": filename,
                "user_email": user_email,
                "type": 'audio' if ext in ['.mp3', '.wav', '.mp4', '.m4a'] else 'pdf',
                "text": transcription_text,
                "segments": segments,
                "summary": summary,
                "uploaded_at": os.path.getmtime(tmp_path)
            }
            inserted = await db["files"].insert_one(file_doc)
            
            results.append({
                "id": str(inserted.inserted_id),
                "filename": filename,
                "type": file_doc["type"],
                "summary": summary
            })

        except Exception as e:
            print(f"Error processing {filename}: {e}")
            continue
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    return {"detail": f"{len(results)} files uploaded and processed.", "files": results}

@router.delete("/{file_id}")
async def delete_file(file_id: str, request: Request, user: dict = Depends(get_current_user)):
    db = request.app.database
    user_email = user.get("email")
    from bson import ObjectId
    
    try:
        result = await db["files"].delete_one({"_id": ObjectId(file_id), "user_email": user_email})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="File not found or unauthorized")
        return {"detail": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
