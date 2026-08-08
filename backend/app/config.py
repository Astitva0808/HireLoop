from dotenv import load_dotenv
import os

load_dotenv()

# LLM Configuration
MODEL = os.getenv("MODEL", "llama-3.3-70b-versatile")
API_KEY = os.getenv("GROQ_API_KEY")
BASE_URL = os.getenv("BASE_URL", "https://api.groq.com/openai/v1")