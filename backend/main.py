from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Documind API")

@app.get("/")
def root():
    return {"message": "API is running"}