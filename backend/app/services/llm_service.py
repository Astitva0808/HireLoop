import os

from pathlib import Path

from openai import OpenAI

from app.config import MODEL, API_KEY, BASE_URL


class LLMService:

    def __init__(self):

        if not API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is not configured in .env"
            )

        self.client = OpenAI(
            api_key=API_KEY,
            base_url=BASE_URL
        )

        self.model = MODEL

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