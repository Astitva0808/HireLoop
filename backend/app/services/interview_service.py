from typing import List, Optional

from app.core.supabase import supabase

from app.models.interview import (
    Interview,
    InterviewCreate,
    InterviewUpdate,
)


class InterviewService:

    # --------------------------------------------------
    # CREATE INTERVIEW
    # --------------------------------------------------

    def create_interview(
        self,
        data: InterviewCreate,
    ) -> Interview:

        existing = (
            supabase
            .table("interviews")
            .select("*")
            .eq(
                "application_id",
                data.application_id,
            )
            .limit(1)
            .execute()
        )

        if existing.data:
            raise ValueError(
                "An interview already exists for this application."
            )

        response = (
            supabase
            .table("interviews")
            .insert(
                data.model_dump()
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create interview."
            )

        return Interview(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET INTERVIEW
    # --------------------------------------------------

    def get_interview(
        self,
        interview_id: str,
    ) -> Optional[Interview]:

        response = (
            supabase
            .table("interviews")
            .select("*")
            .eq("id", interview_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Interview(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET BY APPLICATION
    # --------------------------------------------------

    def get_application_interview(
        self,
        application_id: str,
    ) -> Optional[Interview]:

        response = (
            supabase
            .table("interviews")
            .select("*")
            .eq(
                "application_id",
                application_id,
            )
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Interview(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET CANDIDATE INTERVIEWS
    # --------------------------------------------------

    def get_candidate_interviews(
        self,
        candidate_id: str,
    ) -> List[Interview]:

        response = (
            supabase
            .table("interviews")
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
            Interview(**interview)
            for interview in response.data
        ]

    # --------------------------------------------------
    # GET DRIVE INTERVIEWS
    # --------------------------------------------------

    def get_drive_interviews(
        self,
        drive_id: str,
    ) -> List[Interview]:

        response = (
            supabase
            .table("interviews")
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
            Interview(**interview)
            for interview in response.data
        ]

    # --------------------------------------------------
    # UPDATE INTERVIEW
    # --------------------------------------------------

    def update_interview(
        self,
        interview_id: str,
        data: InterviewUpdate,
    ) -> Optional[Interview]:

        updates = data.model_dump(
            exclude_unset=True
        )

        if not updates:
            return self.get_interview(
                interview_id
            )

        response = (
            supabase
            .table("interviews")
            .update(updates)
            .eq(
                "id",
                interview_id,
            )
            .execute()
        )

        if not response.data:
            return None

        return Interview(
            **response.data[0]
        )

    # --------------------------------------------------
    # DELETE INTERVIEW
    # --------------------------------------------------

    def delete_interview(
        self,
        interview_id: str,
    ) -> bool:

        response = (
            supabase
            .table("interviews")
            .delete()
            .eq(
                "id",
                interview_id,
            )
            .execute()
        )

        return bool(response.data)