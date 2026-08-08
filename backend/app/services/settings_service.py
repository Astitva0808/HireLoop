from typing import Optional

from app.core.supabase import supabase

from app.models.settings import (
    Settings,
    SettingsCreate,
    SettingsUpdate,
)


class SettingsService:

    def create_settings(
        self,
        data: SettingsCreate
    ) -> Settings:

        # One settings object per company
        existing = (
            supabase
            .table("settings")
            .select("id")
            .eq("company_id", data.company_id)
            .limit(1)
            .execute()
        )

        if existing.data:
            raise ValueError(
                "Settings already exist for this company."
            )

        payload = data.model_dump()

        response = (
            supabase
            .table("settings")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create settings."
            )

        return Settings(
            **response.data[0]
        )

    def get_settings(
        self,
        company_id: str
    ) -> Optional[Settings]:

        response = (
            supabase
            .table("settings")
            .select("*")
            .eq("company_id", company_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Settings(
            **response.data[0]
        )

    def update_settings(
        self,
        company_id: str,
        data: SettingsUpdate
    ) -> Optional[Settings]:

        updates = data.model_dump(
            exclude_unset=True
        )

        if not updates:
            return self.get_settings(
                company_id
            )

        response = (
            supabase
            .table("settings")
            .update(updates)
            .eq("company_id", company_id)
            .execute()
        )

        if not response.data:
            return None

        return Settings(
            **response.data[0]
        )