from fastapi import APIRouter

from app.models.candidate_profile import CandidateProfile
from app.models.interview_session import InterviewSession
from app.services.curriculum_mapper import CurriculumMapper
from app.services.feedback_generator import FeedbackGenerator
from app.services.interview_engine import InterviewEngine
from app.services.interview_planner import InterviewPlanner
from app.services.llm_service import LLMService


router = APIRouter()

sessions = {}


@router.post("/interview")
def interview(request: dict):

    session_id = request["sessionId"]

    # -------------------------
    # Start Interview
    # -------------------------

    if "candidate" in request:

        candidate = CandidateProfile(request["candidate"])

        mapper = CurriculumMapper()

        planner = InterviewPlanner(
            candidate,
            mapper
        )

        interview_plan = planner.create_plan()

        session = InterviewSession(
            session_id=session_id,
            candidate=candidate,
            interview_plan=interview_plan
        )

        sessions[session_id] = session

        llm = LLMService()

        engine = InterviewEngine(
            session,
            llm
        )

        question = engine.start_interview()

        return {
            "reply": question,
            "done": False
        }

    # -------------------------
    # Continue Interview
    # -------------------------

    if session_id not in sessions:

        return {
            "reply": "Invalid Session ID.",
            "done": True
        }

    session = sessions[session_id]

    llm = LLMService()

    engine = InterviewEngine(
        session,
        llm
    )

    response = engine.continue_interview(
        previous_question=request["question"],
        candidate_answer=request["message"]
    )

    if response["done"]:

        feedback = FeedbackGenerator(
            session,
            llm
        ).generate()

        del sessions[session_id]

        return {
            "reply": "Interview completed.",
            "done": True,
            "feedback": feedback
        }

    return response