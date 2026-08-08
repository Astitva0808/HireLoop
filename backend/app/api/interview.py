from fastapi import APIRouter

from app.models.candidate_profile import CandidateProfile
from app.models.interview_session import InterviewSession
from app.services.curriculum_mapper import CurriculumMapper
from app.services.feedback_generator import FeedbackGenerator
from app.services.interview_engine import InterviewEngine
from app.services.interview_planner import InterviewPlanner
from app.services.llm_service import LLMService


router = APIRouter()

# WARNING: In-memory session store.
#
# Active interview sessions are stored here for the
# duration of the interview. This means:
#   - Sessions are lost if the server restarts.
#   - Sessions are not shared across uvicorn workers.
#   - This is unsuitable for production deployments.
#
# TODO: Replace with a persistent store (Redis or
# database) before deploying to production.

sessions: dict = {}


def normalize_candidate(candidate_data: dict) -> dict:
    """
    Convert the frontend candidate format into the
    format expected by CandidateProfile.
    """

    experience = candidate_data.get("experience", 0)

    # Convert frontend experience into a number.
    if isinstance(experience, str):

        if experience.lower() == "fresher":
            years_experience = 0

        else:
            try:
                years_experience = float(
                    experience.split()[0]
                )
            except (ValueError, IndexError):
                years_experience = 0

    else:
        years_experience = experience

    # ---------------------------------------------------
    # Create missions from the candidate's skills
    # ---------------------------------------------------

    skills = candidate_data.get("skills", [])

    skill_to_curriculum_day = {
        "python": 1,
        "machine learning": 2,
        "deep learning": 3,
        "llm": 4,
        "large language models": 4,
        "prompt engineering": 5,
        "embeddings": 6,
        "vector databases": 6,
        "rag": 7,
        "retrieval augmented generation": 7,
        "ai agents": 8,
        "agents": 8,
        "deployment": 8,
        "mlops": 8
    }

    missions = []
    used_days = set()

    for skill in skills:

        if not isinstance(skill, str):
            continue

        skill_key = skill.strip().lower()

        day = skill_to_curriculum_day.get(skill_key)

        if day is None:
            continue

        if day in used_days:
            continue

        missions.append(
            {
                "day": day,
                "title": skill.strip(),
                "passed": True,
                "skipped": False
            }
        )

        used_days.add(day)

    # ---------------------------------------------------
    # If the frontend doesn't provide recognised skills,
    # use the complete AI Engineering curriculum.
    # ---------------------------------------------------

    if not missions:

        missions = [
            {
                "day": 1,
                "title": "Python & Software Engineering",
                "passed": False,
                "skipped": False
            },
            {
                "day": 2,
                "title": "Machine Learning Fundamentals",
                "passed": False,
                "skipped": False
            },
            {
                "day": 3,
                "title": "Deep Learning",
                "passed": False,
                "skipped": False
            },
            {
                "day": 4,
                "title": "LLM Fundamentals",
                "passed": False,
                "skipped": False
            },
            {
                "day": 5,
                "title": "Prompt Engineering",
                "passed": False,
                "skipped": False
            },
            {
                "day": 6,
                "title": "Embeddings & Vector Databases",
                "passed": False,
                "skipped": False
            },
            {
                "day": 7,
                "title": "RAG Systems",
                "passed": False,
                "skipped": False
            },
            {
                "day": 8,
                "title": "AI Agents & Deployment",
                "passed": False,
                "skipped": False
            }
        ]

    return {
        "member": {
            "id": candidate_data.get(
                "id",
                "frontend-candidate"
            ),
            "name": candidate_data.get(
                "name",
                "Candidate"
            ),
            "jobRole": candidate_data.get(
                "role",
                "AI Engineer"
            ),
            "yearsExperience": years_experience,
            "education": candidate_data.get(
                "education",
                ""
            ),
            "status": "active"
        },

        "signals": {
            "commitDays": candidate_data.get(
                "commitDays",
                0
            ),
            "missionsFirstTry": candidate_data.get(
                "missionsFirstTry",
                0
            )
        },

        "missions": missions
    }


@router.post("/interview")
def interview(request: dict):

    session_id = request["sessionId"]

    # ===================================================
    # START INTERVIEW
    # ===================================================

    if "candidate" in request:

        raw_candidate = request["candidate"]

        candidate_data = normalize_candidate(
            raw_candidate
        )

        candidate = CandidateProfile(
            candidate_data
        )

        # Curriculum is now required because our missions
        # contain curriculum day numbers.
        mapper = CurriculumMapper()

        planner = InterviewPlanner(
            candidate,
            mapper
        )

        interview_plan = planner.create_plan()

        # Safety check
        if not interview_plan:
            return {
                "reply": "Unable to create an interview plan.",
                "done": True
            }

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

    # ===================================================
    # CONTINUE INTERVIEW
    # ===================================================

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

    # ===================================================
    # INTERVIEW COMPLETE
    # ===================================================

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