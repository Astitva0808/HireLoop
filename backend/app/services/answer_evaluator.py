import json

from app.models.interview_session import InterviewSession
from app.services.llm_service import LLMService


class AnswerEvaluator:

    def __init__(
        self,
        session: InterviewSession,
        llm: LLMService
    ):
        self.session = session
        self.llm = llm

        self.evaluation_prompt = self.llm.load_prompt(
            "evaluation_prompt.txt"
        )

    def evaluate(
        self,
        topic: dict,
        question: str,
        answer: str
    ):

        user_prompt = f"""
Topic:
{topic["title"]}

Learning Objectives:
{json.dumps(topic["objectives"], indent=2)}

Interview Question:
{question}

Candidate Answer:
{answer}
"""

        response = self.llm.generate(
            system_prompt=self.evaluation_prompt,
            user_prompt=user_prompt,
            temperature=0.2
        )

        try:
            return json.loads(response)

        except Exception:

            return {
                "score": 0,
                "decision": "follow_up",
                "reason": "Unable to evaluate the answer.",
                "follow_up_question": ""
            }