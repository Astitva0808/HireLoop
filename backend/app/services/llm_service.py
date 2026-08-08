import os

from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


class LLMService:

    def __init__(self):

        self.client = OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1"
        )

        self.model = os.getenv(
            "MODEL",
            "llama-3.3-70b-versatile"
        )

    def load_prompt(self, filename: str):

        prompt_path = (
            Path(__file__).parent.parent
            / "prompts"
            / filename
        )

        with open(prompt_path, "r", encoding="utf-8") as file:
            return file.read()

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 512
    ):

        response = self.client.chat.completions.create(
            model=self.model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
        )

        return response.choices[0].message.content.strip()