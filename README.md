# DocuMind - AI-Powered Document & Multimedia Q&A

**DocumMind** is a full-stack web application that allows users to upload documents (PDF) and multimedia files (Audio/Video), receive an instant AI summary, and interact with a chatbot that answers questions based on the file content. 

It features a **Zero-Cost** architecture, leveraging local AI models (Whisper, extracted text search) to run completely free without external API keys.

---

## Features

### Core Functionality
-   **Multi-Format Support**: Upload PDF documents, MP3 audio, and MP4 video files.
-   **Local Transcription**: Uses OpenAI's **Whisper** model (running locally) to transcribe audio/video with high accuracy.
-   **Smart Contextual Chat**: 
    -   Key-phrase matching chatbot that quotes exact sentences from your files.
    -   **Zero Hallucinations**: Answers are strictly grounded in the document content.
-   **Timestamp Navigation**: 
    -   Why read when you can listen? The chatbot provides **clickable timestamps** (e.g., `[00:45]`).
    -   Jumps the built-in media player to the exact moment the topic is discussed.
-   **AI Summaries**: Instantly auto-generates a summary preview of any uploaded file.

### User Experience
-   **Premium UI**: Glassmorphism aesthetic, dark mode, and smooth animations using Tailwind CSS.
-   **Drag & Drop**: Intuitive file upload interface.
-   **Authentication**: Secure Multi-User Login & Registration system (JWT-based).

---

## Tech Stack

### Backend
-   **Framework**: FastAPI (Python 3.12)
-   **Database**: MongoDB (Async Motor driver)
-   **Caching/Rate Limiting**: Redis
-   **AI/ML**: 
    -   `openai-whisper` (ASR/Transcription)
    -   `pypdf` (Document Parsing)
    -   `argon2-cffi` (Secure Password Hashing)
-   **Authentication**: OAuth2 with JWT (JSON Web Tokens)

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS, Lucide Icons
-   **HTTP Client**: Axios

### Infrastructure
-   **Containerization**: Docker & Docker Compose
-   **CI/CD**: GitHub Actions

---

## Getting Started

### Prerequisites
-   Python 3.10+
-   Node.js 18+
-   MongoDB (running locally on port 27017 or Docker)
-   Redis (running locally on port 6379 or Docker - **Required for Rate Limiting**)
-   FFmpeg (required for Whisper)

### 0. Clone the Repository
```bash
git clone https://github.com/your-username/Documind.git
cd Documind
```

### 1. Environment Setup (.env)
Create a `.env` file in the `backend` directory:
```env
MONGO_URI="mongodb://localhost:27017"
MONGO_DB="Document"
JWT_SECRET="your_secret_key"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY="your_groq_api_key"
REDIS_URL="redis://localhost:6379"
```

### 2. Start Services (Redis & MongoDB)
Use Docker to start the vital services:
```bash
docker-compose up -d redis mongodb
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
*Backend runs on `http://localhost:8000`*

###  API Documentation (Swagger UI)
Once the backend is running, you can access the interactive API docs at:
-   **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
-   **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 4. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Run the development server
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. Docker Setup (Alternative)
Run the entire stack with a single command:
```bash
docker-compose up --build
```

---

## Running Tests
To verify the codebase and check 95% coverage:
```bash
cd backend
pytest --cov=. --cov-report=term-missing
```

## Manual Verifications

### 1. Authentication
1.  Go to the app, click **Sign Up**.
2.  Register. You will be redirected to Login.
3.  Log in to access the dashboard.

### 2. File Q&A
1.  Upload a **PDF**.
2.  Ask a specific question about the text.
3.  The bot should quote the exact sentence.

### 3. Video Seek
1.  Upload a **Video/Audio** file.
2.  Ask about a spoken topic.
3.  Click the blue timestamp button `[00:xx]` to jump the player.

---
