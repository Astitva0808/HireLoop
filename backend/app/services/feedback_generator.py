import json

from app.models.interview_session import InterviewSession
from app.services.llm_service import LLMService


class FeedbackGenerator:

    def __init__(
        self,
        session: InterviewSession,
        llm: LLMService
    ):
        self.session = session
        self.llm = llm

        self.feedback_prompt = self.llm.load_prompt(
            "feedback_prompt.txt"
        )

    def generate(self):

        interview_history = ""

        for index, item in enumerate(
            self.session.get_history(),
            start=1
        ):
            interview_history += (
                f"Question {index}: {item['question']}\n"
                f"Answer: {item['answer']}\n\n"
            )

        user_prompt = f"""
Candidate Name:
{self.session.candidate.name}

Role:
{self.session.candidate.role}

Experience:
{self.session.candidate.experience}

Interview History:

{interview_history}
"""

        response = self.llm.generate(
            system_prompt=self.feedback_prompt,
            user_prompt=user_prompt,
            temperature=0.3
        )

        try:
            return json.loads(response)

        except Exception:
            return {
                "summary": "Unable to generate feedback.",
                "strengths": [],
                "gaps": [],
                "next": []
            }