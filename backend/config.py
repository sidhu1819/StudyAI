import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS')
    
    # Check if we should use local JSON storage as a fallback
    USE_LOCAL_STORAGE = not bool(FIREBASE_CREDENTIALS)
