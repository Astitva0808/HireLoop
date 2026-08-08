from app.models.interview_session import InterviewSession
from app.services.answer_evaluator import AnswerEvaluator
from app.services.llm_service import LLMService


class InterviewEngine:

    def __init__(
        self,
        session: InterviewSession,
        llm: LLMService
    ):
        self.session = session
        self.llm = llm
        self.evaluator = AnswerEvaluator(session, llm)

        self.interviewer_prompt = self.llm.load_prompt(
            "interviewer_prompt.txt"
        )

    def start_interview(self):

        topic = self.session.get_current_topic()

        user_prompt = f"""
Candidate Name:
{self.session.candidate.name}

Role:
{self.session.candidate.role}

Experience:
{self.session.candidate.experience}

Current Topic:
{topic['title']}

Learning Objectives:
{chr(10).join(topic['objectives'])}

Ask the first interview question.
"""

        question = self.llm.generate(
            system_prompt=self.interviewer_prompt,
            user_prompt=user_prompt
        )

        return question

    def continue_interview(
        self,
        previous_question: str,
        candidate_answer: str
    ):

        topic = self.session.get_current_topic()

        evaluation = self.evaluator.evaluate(
            topic,
            previous_question,
            candidate_answer
        )

        self.session.save_answer(
            previous_question,
            candidate_answer
        )

        if evaluation["decision"] == "follow_up":

            user_prompt = f"""
Topic:
{topic['title']}

Reason:
{evaluation['reason']}

Candidate Answer:
{candidate_answer}

Generate ONE follow-up interview question.
"""

            follow_up = self.llm.generate(
                system_prompt=self.interviewer_prompt,
                user_prompt=user_prompt
            )

            return {
                "reply": follow_up,
                "done": False
            }

        self.session.next_question()

        if self.session.is_completed():

            return {
                "reply": "Interview completed.",
                "done": True
            }

        next_topic = self.session.get_current_topic()

        user_prompt = f"""
Candidate Name:
{self.session.candidate.name}

Role:
{self.session.candidate.role}

Experience:
{self.session.candidate.experience}

Current Topic:
{next_topic['title']}

Learning Objectives:
{chr(10).join(next_topic['objectives'])}

Generate the next interview question.
"""

        next_question = self.llm.generate(
            system_prompt=self.interviewer_prompt,
            user_prompt=user_prompt
        )

        return {
            "reply": next_question,
            "done": False
        }