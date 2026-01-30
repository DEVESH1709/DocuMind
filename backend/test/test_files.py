import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
import routers.files

# Mock Whisper Model
# We patch the 'model' variable in routers.files directly
@pytest.fixture
def mock_whisper():
    mock = MagicMock()
    mock.transcribe.return_value = {
        "text": "This is a mocked transcription.", 
        "segments": [{"start": 0.0, "end": 1.0, "text": "This is"}]
    }
    with patch.object(routers.files, "model", mock):
        yield mock

@pytest.mark.asyncio
async def test_upload_audio(client: AsyncClient, mock_whisper, override_auth):
    
    files = {"file": ("test_audio.mp3", b"fake audio content", "audio/mpeg")}
    
    response = await client.post("/files/upload", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_audio.mp3"
    assert "transcription" in data
    assert data["transcription"] == "This is a mocked transcription."
    
    mock_whisper.transcribe.assert_called_once()

@pytest.mark.asyncio
async def test_upload_pdf(client: AsyncClient, override_auth):
    
    with patch("routers.files.PdfReader") as MockPdfReader:
        mock_reader = MockPdfReader.return_value
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Mocked PDF content."
        mock_reader.pages = [mock_page]
        
        files = {"file": ("test.pdf", b"%PDF-1.4...", "application/pdf")}
        response = await client.post("/files/upload", files=files)
        
        assert response.status_code == 200
        data = response.json()
        assert "Mocked PDF content" in data["transcription"]
