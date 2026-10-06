import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
import routers.files

# Mock Groq Whisper API
@pytest.fixture
def mock_groq():
    mock = MagicMock()
    mock_trans = MagicMock()
    mock_trans.text = "This is a mocked transcription."
    mock_trans.segments = [{"id": 0, "start": 0.0, "end": 1.0, "text": "This is"}]
    mock.audio.transcriptions.create.return_value = mock_trans
    with patch.object(routers.files, "groq_client", mock):
        yield mock

@pytest.mark.asyncio
async def test_upload_audio(client: AsyncClient, mock_groq, override_auth):
    
    files = [("files", ("test_audio.mp3", b"fake audio content", "audio/mpeg"))]
    
    response = await client.post("/files/upload", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "files" in data
    assert len(data["files"]) == 1
    assert data["files"][0]["filename"] == "test_audio.mp3"
    
    mock_groq.audio.transcriptions.create.assert_called_once()

@pytest.mark.asyncio
async def test_upload_pdf(client: AsyncClient, override_auth):
    
    with patch("routers.files.PdfReader") as MockPdfReader:
        mock_reader = MockPdfReader.return_value
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Mocked PDF content."
        mock_reader.pages = [mock_page]
        
        files = [("files", ("test.pdf", b"%PDF-1.4...", "application/pdf"))]
        response = await client.post("/files/upload", files=files)
        
        assert response.status_code == 200
        data = response.json()
        assert "files" in data
        assert len(data["files"]) == 1
        assert data["files"][0]["filename"] == "test.pdf"
