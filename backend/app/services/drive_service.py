from typing import List, Optional

from app.core.supabase import supabase

from app.models.drive import (
    Drive,
    DriveCreate,
    DriveUpdate,
)


class DriveService:

    # --------------------------------------------------
    # CREATE DRIVE
    # --------------------------------------------------

    def create_drive(
        self,
        data: DriveCreate,
    ) -> Drive:

        response = (
            supabase
            .table("drives")
            .insert(data.model_dump())
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create drive."
            )

        return Drive(**response.data[0])

    # --------------------------------------------------
    # GET DRIVE
    # --------------------------------------------------

    def get_drive(
        self,
        drive_id: str,
    ) -> Optional[Drive]:

        response = (
            supabase
            .table("drives")
            .select("*")
            .eq("id", drive_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Drive(**response.data[0])

    # --------------------------------------------------
    # GET COMPANY DRIVES
    # --------------------------------------------------

    def get_company_drives(
        self,
        company_id: str,
    ) -> List[Drive]:

        response = (
            supabase
            .table("drives")
            .select("*")
            .eq("company_id", company_id)
            .order("created_at", desc=True)
            .execute()
        )

        return [
            Drive(**drive)
            for drive in response.data
        ]

    # --------------------------------------------------
    # GET OPEN DRIVES
    # --------------------------------------------------

    def get_open_drives(self) -> List[Drive]:

        response = (
            supabase
            .table("drives")
            .select("*")
            .eq("status", "open")
            .order("created_at", desc=True)
            .execute()
        )

        return [
            Drive(**drive)
            for drive in response.data
        ]

    # --------------------------------------------------
    # UPDATE DRIVE
    # --------------------------------------------------

    def update_drive(
        self,
        drive_id: str,
        data: DriveUpdate,
    ) -> Optional[Drive]:

        updates = data.model_dump(
            exclude_unset=True
        )

        if not updates:
            return self.get_drive(drive_id)

        response = (
            supabase
            .table("drives")
            .update(updates)
            .eq("id", drive_id)
            .execute()
        )

        if not response.data:
            return None

        return Drive(**response.data[0])

    # --------------------------------------------------
    # DELETE DRIVE
    # --------------------------------------------------

    def delete_drive(
        self,
        drive_id: str,
    ) -> bool:

        response = (
            supabase
            .table("drives")
            .delete()
            .eq("id", drive_id)
            .execute()
        )

        return bool(response.data)