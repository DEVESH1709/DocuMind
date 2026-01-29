from fastapi import APIRouter, Depends, UploadFile, File,HTTPException, Request
from utils import get_current_user, Settings
import shutil
import os
import whisper
from tempfile import NamedTemporaryFile
from pypdf import PdfReader
from state import global_state

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

@router.post("/upload")
async def upload_file(request : Request, file: UploadFile = File(...)):
    db= request.app.database
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
                
                print(f"Transcription Result Length: {len(transcription_text)}")
                
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
        else:
             summary = "Unsupported file type for auto-processing."

        file_doc = {
            "filename": filename,
            "type": 'audio' if ext in ['.mp3', '.wav', '.mp4', '.m4a'] else 'pdf',
            "text": transcription_text,
            "segments": segments, 
        }
        await db["files"].insert_one(file_doc)
        
        global_state.last_uploaded_text = transcription_text
        global_state.transcription_segments = segments
        global_state.last_uploaded_type = file_doc["type"]
        
        return {
            "filename": filename,
            "detail": "File uploaded and processed.",
            "summary": summary,
            "transcription": transcription_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
