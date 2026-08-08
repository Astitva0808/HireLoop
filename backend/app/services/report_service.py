from typing import List, Optional

from app.core.supabase import supabase

from app.models.report import (
    Report,
    ReportCreate,
    ReportUpdate,
)


class ReportService:

    # --------------------------------------------------
    # CREATE REPORT
    # --------------------------------------------------

    def create_report(
        self,
        data: ReportCreate,
    ) -> Report:

        existing = (
            supabase
            .table("reports")
            .select("*")
            .eq(
                "interview_id",
                data.interview_id,
            )
            .limit(1)
            .execute()
        )

        if existing.data:
            raise ValueError(
                "A report already exists for this interview."
            )

        response = (
            supabase
            .table("reports")
            .insert(
                data.model_dump()
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create report."
            )

        return Report(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET REPORT
    # --------------------------------------------------

    def get_report(
        self,
        report_id: str,
    ) -> Optional[Report]:

        response = (
            supabase
            .table("reports")
            .select("*")
            .eq("id", report_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Report(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET REPORT BY INTERVIEW
    # --------------------------------------------------

    def get_report_by_interview(
        self,
        interview_id: str,
    ) -> Optional[Report]:

        response = (
            supabase
            .table("reports")
            .select("*")
            .eq(
                "interview_id",
                interview_id,
            )
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Report(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET CANDIDATE REPORTS
    # --------------------------------------------------

    def get_candidate_reports(
        self,
        candidate_id: str,
    ) -> List[Report]:

        response = (
            supabase
            .table("reports")
            .select("*")
            .eq(
                "candidate_id",
                candidate_id,
            )
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        return [
            Report(**report)
            for report in response.data
        ]

    # --------------------------------------------------
    # GET DRIVE REPORTS
    # --------------------------------------------------

    def get_drive_reports(
        self,
        drive_id: str,
    ) -> List[Report]:

        response = (
            supabase
            .table("reports")
            .select("*")
            .eq(
                "drive_id",
                drive_id,
            )
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        return [
            Report(**report)
            for report in response.data
        ]

    # --------------------------------------------------
    # UPDATE REPORT
    # --------------------------------------------------

    def update_report(
        self,
        report_id: str,
        data: ReportUpdate,
    ) -> Optional[Report]:

        updates = data.model_dump(
            exclude_unset=True
        )

        if not updates:
            return self.get_report(
                report_id
            )

        response = (
            supabase
            .table("reports")
            .update(updates)
            .eq(
                "id",
                report_id,
            )
            .execute()
        )

        if not response.data:
            return None

        return Report(
            **response.data[0]
        )

    # --------------------------------------------------
    # DELETE REPORT
    # --------------------------------------------------

    def delete_report(
        self,
        report_id: str,
    ) -> bool:

        response = (
            supabase
            .table("reports")
            .delete()
            .eq(
                "id",
                report_id,
            )
            .execute()
        )

        return bool(response.data)