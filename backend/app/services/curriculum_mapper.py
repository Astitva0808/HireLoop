import json
from pathlib import Path


class CurriculumMapper:
    """
    Maps candidate missions with curriculum details.
    """

    def __init__(self):
        curriculum_path = (
            Path(__file__).parent.parent
            / "data"
            / "curriculum.json"
        )

        with open(curriculum_path, "r", encoding="utf-8") as file:
            self.curriculum = json.load(file)

        self.modules = self.curriculum["modules"]
        self.days = self.curriculum["days"]

    def get_day(self, day_number: int):
        for day in self.days:
            if day["day"] == day_number:
                return day
        return None

    def get_module(self, day_number: int):
        for module in self.modules:
            start_day, end_day = module["days"]

            if start_day <= day_number <= end_day:
                return module["title"]

        return None

    def enrich_mission(self, mission: dict):
        day = self.get_day(mission["day"])

        if day is None:
            return mission

        enriched = mission.copy()

        enriched["module"] = self.get_module(mission["day"])
        enriched["type"] = day["type"]
        enriched["tools"] = day["tools"]
        enriched["objectives"] = day["objectives"]

        return enriched

    def enrich_missions(self, missions: list):
        return [
            self.enrich_mission(mission)
            for mission in missions
        ]