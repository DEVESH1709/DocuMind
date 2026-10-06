from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse
from utils import get_current_user, Settings
import shutil
import os
from groq import Groq
from tempfile import NamedTemporaryFile
from pypdf import PdfReader
from state import global_state

from typing import List

router = APIRouter(dependencies=[Depends(get_current_user)])
settings = Settings()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ffmpeg_dir = r"C:\Users\Devesh Kesharwani\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin"

if os.path.exists(ffmpeg_dir):
    os.environ["Path"] +=os.pathsep + ffmpeg_dir
    print(f"Injected FFmpeg path: {ffmpeg_dir}")

groq_client = Groq(api_key=settings.GROQ_API_KEY) if getattr(settings, 'GROQ_API_KEY', None) else None

@router.get("/media/{filename}")
async def get_media(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Media file not found")

@router.get("/")
async def get_files(request: Request, user: dict = Depends(get_current_user)):
    db = request.app.database
    user_email = user.get("email") or user.get("sub")
    files = await db["files"].find({"user_email": user_email}).to_list(length=100)
    base_url = str(request.base_url).rstrip('/')
    for f in files:
        f["_id"] = str(f["_id"])
        if not f.get("media_url") and f.get("type") in ['audio', 'video']:
            f["media_url"] = f"{base_url}/media/{f.get('filename')}"
    return files

@router.post("/upload")
async def upload_files(request : Request, files: List[UploadFile] = File(...), user: dict = Depends(get_current_user)):
    db= request.app.database
    user_email = user.get("email") or user.get("sub")
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
                if groq_client:
                    print(f"Transcribing file via Groq Whisper API: {filename}")
                    try:
                        with open(tmp_path, "rb") as audio_file:
                            transcription = groq_client.audio.transcriptions.create(
                                file=(filename, audio_file.read()),
                                model="whisper-large-v3",
                                response_format="verbose_json",
                            )
                        transcription_text = getattr(transcription, "text", "") or ""
                        transcription_text = transcription_text.strip()
                        raw_segments = getattr(transcription, "segments", []) or []
                        segments = [
                            {
                                "id": getattr(s, "id", idx),
                                "start": getattr(s, "start", 0),
                                "end": getattr(s, "end", 0),
                                "text": getattr(s, "text", "")
                            }
                            if not isinstance(s, dict) else s
                            for idx, s in enumerate(raw_segments)
                        ]
                        if transcription_text:
                            summary = f"Transcription Preview: {transcription_text[:200]}..."
                        else:
                            summary = "Processed successfully, but no speech was detected."
                    except Exception as trans_err:
                        print(f"Groq Whisper transcription error: {trans_err}")
                        summary = f"Transcription error: {trans_err}"
                else:
                    summary = "GROQ_API_KEY missing. Audio transcription skipped."
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

            base_url = str(request.base_url).rstrip('/')
            is_media = ext in ['.mp3', '.wav', '.mp4', '.m4a']
            media_url = None
            if is_media:
                media_dest = os.path.join(UPLOAD_DIR, filename)
                try:
                    shutil.copyfile(tmp_path, media_dest)
                    media_url = f"{base_url}/media/{filename}"
                except Exception as save_err:
                    print(f"Warning: Could not save persistent media copy: {save_err}")

            file_doc = {
                "filename": filename,
                "user_email": user_email,
                "type": 'audio' if is_media else 'pdf',
                "media_url": media_url,
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
                "media_url": media_url,
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
