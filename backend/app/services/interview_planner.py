import random

from app.models.candidate_profile import CandidateProfile
from app.services.curriculum_mapper import CurriculumMapper


class InterviewPlanner:
    """
    Creates an interview plan based on the candidate profile.
    """

    MINIMUM_QUESTIONS = 8

    def __init__(
        self,
        candidate: CandidateProfile,
        curriculum_mapper: CurriculumMapper
    ):
        self.candidate = candidate
        self.mapper = curriculum_mapper

    def create_plan(self):

        interview_plan = []

        # Questions from failed topics
        failed = self.mapper.enrich_missions(
            self.candidate.failed_topics
        )

        # Questions from skipped topics
        skipped = self.mapper.enrich_missions(
            self.candidate.skipped_topics
        )

        # Questions from completed topics
        completed = self.mapper.enrich_missions(
            self.candidate.completed_topics
        )

        random.shuffle(completed)

        interview_plan.extend(failed)
        interview_plan.extend(skipped)

        for topic in completed:

            if len(interview_plan) >= self.MINIMUM_QUESTIONS:
                break

            interview_plan.append(topic)

        return interview_plan[: self.MINIMUM_QUESTIONS]