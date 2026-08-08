from typing import Dict, List


class CandidateProfile:
    """
    Represents a candidate throughout the interview.
    """

    def __init__(self, candidate_data: Dict):
        self.member = candidate_data["member"]
        self.signals = candidate_data["signals"]
        self.missions = candidate_data["missions"]

        self.completed_topics = []
        self.failed_topics = []
        self.skipped_topics = []

        self._categorize_missions()

    def _categorize_missions(self):
        """
        Separate completed, failed and skipped missions.
        """

        for mission in self.missions:

            if mission.get("skipped", False):
                self.skipped_topics.append(mission)

            elif mission.get("passed", False):
                self.completed_topics.append(mission)

            else:
                self.failed_topics.append(mission)

    # ---------------------------------------------------
    # Candidate Information
    # ---------------------------------------------------

    @property
    def id(self):
        return self.member["id"]

    @property
    def name(self):
        return self.member["name"]

    @property
    def role(self):
        return self.member["jobRole"]

    @property
    def experience(self):
        return self.member["yearsExperience"]

    @property
    def education(self):
        return self.member["education"]

    @property
    def status(self):
        return self.member["status"]

    # ---------------------------------------------------
    # Statistics
    # ---------------------------------------------------

    @property
    def total_completed(self):
        return len(self.completed_topics)

    @property
    def total_failed(self):
        return len(self.failed_topics)

    @property
    def total_skipped(self):
        return len(self.skipped_topics)

    @property
    def strength_score(self):
        """
        Calculates an overall learning score (0-100).
        """

        score = 50

        score += self.total_completed * 2
        score -= self.total_failed * 5
        score -= self.total_skipped * 3

        score += self.signals["commitDays"] * 0.5
        score += self.signals["missionsFirstTry"] * 0.4

        return round(max(0, min(score, 100)), 2)

    # ---------------------------------------------------
    # Helper Methods
    # ---------------------------------------------------

    def has_failed_topics(self):
        return len(self.failed_topics) > 0

    def has_skipped_topics(self):
        return len(self.skipped_topics) > 0

    def has_completed_topics(self):
        return len(self.completed_topics) > 0

    def is_beginner(self):
        return self.experience <= 2

    def is_intermediate(self):
        return 2 < self.experience <= 7

    def is_expert(self):
        return self.experience > 7

    # ---------------------------------------------------
    # Get Topics
    # ---------------------------------------------------

    def get_completed_titles(self) -> List[str]:
        return [topic["title"] for topic in self.completed_topics]

    def get_failed_titles(self) -> List[str]:
        return [topic["title"] for topic in self.failed_topics]

    def get_skipped_titles(self) -> List[str]:
        return [topic["title"] for topic in self.skipped_topics]

    # ---------------------------------------------------
    # Summary
    # ---------------------------------------------------

    def summary(self):

        return {
            "candidate": {
                "id": self.id,
                "name": self.name,
                "role": self.role,
                "experience": self.experience,
                "education": self.education,
                "status": self.status
            },

            "missions": {
                "completed": self.completed_topics,
                "failed": self.failed_topics,
                "skipped": self.skipped_topics
            },

            "signals": self.signals,

            "statistics": {
                "completed": self.total_completed,
                "failed": self.total_failed,
                "skipped": self.total_skipped,
                "strength_score": self.strength_score
            }
        }