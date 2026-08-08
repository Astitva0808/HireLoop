from typing import List, Optional

from app.core.supabase import supabase

from app.models.application import (
    Application,
    ApplicationCreate,
    ApplicationUpdate,
)


class ApplicationService:

    # --------------------------------------------------
    # CREATE APPLICATION
    # --------------------------------------------------

    def create_application(
        self,
        candidate_id: str,
        data: ApplicationCreate,
    ) -> Application:

        # Prevent duplicate applications
        existing = (
            supabase
            .table("applications")
            .select("*")
            .eq("drive_id", data.drive_id)
            .eq("candidate_id", candidate_id)
            .limit(1)
            .execute()
        )

        if existing.data:
            raise ValueError(
                "You have already applied to this drive."
            )

        payload = {
            "drive_id": data.drive_id,
            "candidate_id": candidate_id,
            "status": "pending",
        }

        response = (
            supabase
            .table("applications")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create application."
            )

        return Application(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET APPLICATION
    # --------------------------------------------------

    def get_application(
        self,
        application_id: str,
    ) -> Optional[Application]:

        response = (
            supabase
            .table("applications")
            .select("*")
            .eq("id", application_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Application(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET CANDIDATE APPLICATIONS
    # --------------------------------------------------

    def get_candidate_applications(
        self,
        candidate_id: str,
    ) -> List[Application]:

        response = (
            supabase
            .table("applications")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        return [
            Application(**application)
            for application in response.data
        ]

    # --------------------------------------------------
    # GET DRIVE APPLICATIONS
    # --------------------------------------------------

    def get_drive_applications(
        self,
        drive_id: str,
    ) -> List[Application]:

        response = (
            supabase
            .table("applications")
            .select("*")
            .eq("drive_id", drive_id)
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        return [
            Application(**application)
            for application in response.data
        ]

    # --------------------------------------------------
    # UPDATE APPLICATION
    # --------------------------------------------------

    def update_application(
        self,
        application_id: str,
        data: ApplicationUpdate,
    ) -> Optional[Application]:

        updates = data.model_dump(
            exclude_unset=True
        )

        if not updates:
            return self.get_application(
                application_id
            )

        response = (
            supabase
            .table("applications")
            .update(updates)
            .eq("id", application_id)
            .execute()
        )

        if not response.data:
            return None

        return Application(
            **response.data[0]
        )

    # --------------------------------------------------
    # DELETE APPLICATION
    # --------------------------------------------------

    def delete_application(
        self,
        application_id: str,
    ) -> bool:

        response = (
            supabase
            .table("applications")
            .delete()
            .eq("id", application_id)
            .execute()
        )

        return bool(response.data)