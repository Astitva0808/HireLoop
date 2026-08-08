from typing import Any, Dict

from app.core.supabase import supabase


class AnalyticsService:

    def get_company_analytics(
        self,
        company_id: str,
    ) -> Dict[str, Any]:

        # --------------------------------------------------
        # DRIVES
        # --------------------------------------------------

        drives_response = (
            supabase
            .table("drives")
            .select("id, status")
            .eq("company_id", company_id)
            .execute()
        )

        drives = drives_response.data or []

        total_drives = len(drives)

        active_drives = sum(
            1
            for drive in drives
            if drive.get("status") == "open"
        )

        drive_ids = [
            drive["id"]
            for drive in drives
        ]

        # --------------------------------------------------
        # NO DRIVES
        # --------------------------------------------------

        if not drive_ids:
            return {
                "total_drives": 0,
                "active_drives": 0,
                "total_applications": 0,
                "pending_applications": 0,
                "accepted_applications": 0,
                "rejected_applications": 0,
                "total_interviews": 0,
                "completed_interviews": 0,
                "average_interview_score": 0,
                "selected_candidates": 0,
                "rejected_candidates": 0,
                "application_to_interview_rate": 0,
                "interview_to_selection_rate": 0,
            }

        # --------------------------------------------------
        # APPLICATIONS
        # --------------------------------------------------

        applications_response = (
            supabase
            .table("applications")
            .select(
                "id, drive_id, candidate_id, status"
            )
            .in_(
                "drive_id",
                drive_ids,
            )
            .execute()
        )

        applications = (
            applications_response.data or []
        )

        total_applications = len(
            applications
        )

        pending_applications = sum(
            1
            for application in applications
            if application.get("status")
            == "pending"
        )

        accepted_applications = sum(
            1
            for application in applications
            if application.get("status")
            == "accepted"
        )

        rejected_applications = sum(
            1
            for application in applications
            if application.get("status")
            == "rejected"
        )

        # --------------------------------------------------
        # INTERVIEWS
        # --------------------------------------------------

        interviews_response = (
            supabase
            .table("interviews")
            .select(
                "id, drive_id, candidate_id, status"
            )
            .in_(
                "drive_id",
                drive_ids,
            )
            .execute()
        )

        interviews = (
            interviews_response.data or []
        )

        total_interviews = len(
            interviews
        )

        completed_interviews = sum(
            1
            for interview in interviews
            if interview.get("status")
            == "completed"
        )

        # --------------------------------------------------
        # REPORTS / SCORES
        # --------------------------------------------------

        reports_response = (
            supabase
            .table("reports")
            .select(
                "id, drive_id, candidate_id, overall_score, status"
            )
            .in_(
                "drive_id",
                drive_ids,
            )
            .execute()
        )

        reports = (
            reports_response.data or []
        )

        scores = []

        for report in reports:

            score = report.get(
                "overall_score"
            )

            if score is not None:

                try:
                    scores.append(
                        float(score)
                    )
                except (
                    TypeError,
                    ValueError,
                ):
                    pass

        average_score = (
            sum(scores) / len(scores)
            if scores
            else 0
        )

        # --------------------------------------------------
        # SELECTION / REJECTION
        # --------------------------------------------------

        selected_candidates = accepted_applications

        rejected_candidates = rejected_applications

        # --------------------------------------------------
        # CONVERSION RATES
        # --------------------------------------------------

        application_to_interview_rate = 0

        if total_applications > 0:

            application_to_interview_rate = (
                total_interviews
                / total_applications
            ) * 100

        interview_to_selection_rate = 0

        if total_interviews > 0:

            interview_to_selection_rate = (
                selected_candidates
                / total_interviews
            ) * 100

        # --------------------------------------------------
        # RESULT
        # --------------------------------------------------

        return {
            "total_drives": total_drives,
            "active_drives": active_drives,

            "total_applications": total_applications,
            "pending_applications": pending_applications,
            "accepted_applications": accepted_applications,
            "rejected_applications": rejected_applications,

            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,

            "average_interview_score": round(
                average_score,
                2,
            ),

            "selected_candidates": selected_candidates,
            "rejected_candidates": rejected_candidates,

            "application_to_interview_rate": round(
                application_to_interview_rate,
                2,
            ),

            "interview_to_selection_rate": round(
                interview_to_selection_rate,
                2,
            ),
        }