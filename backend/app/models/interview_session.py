from app.models.candidate_profile import CandidateProfile


class InterviewSession:

    def __init__(
        self,
        session_id: str,
        candidate: CandidateProfile,
        interview_plan: list
    ):
        self.session_id = session_id
        self.candidate = candidate
        self.interview_plan = interview_plan

        self.current_question = 0
        self.completed = False

        self.history = []

    def get_current_topic(self):

        if self.current_question >= len(self.interview_plan):
            return None

        return self.interview_plan[self.current_question]

    def save_answer(
        self,
        question: str,
        answer: str
    ):

        self.history.append(
            {
                "question": question,
                "answer": answer
            }
        )

    def next_question(self):

        self.current_question += 1

        if self.current_question >= len(self.interview_plan):
            self.completed = True

    def is_completed(self):
        return self.completed

    def get_history(self):
        return self.history  