from typing import Optional

from app.core.supabase import supabase

from app.models.profile import (
    Profile,
    ProfileCreate,
    ProfileUpdate,
)


class ProfileService:

    # --------------------------------------------------
    # CREATE PROFILE
    # --------------------------------------------------

    def create_profile(
        self,
        data: ProfileCreate
    ) -> Profile:

        existing = (
            supabase
            .table("profiles")
            .select("*")
            .eq("id", data.id)
            .limit(1)
            .execute()
        )

        if existing.data:
            return Profile(**existing.data[0])

        response = (
            supabase
            .table("profiles")
            .insert(
                data.model_dump()
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create profile."
            )

        return Profile(**response.data[0])

    # --------------------------------------------------
    # GET PROFILE
    # --------------------------------------------------

    def get_profile(
        self,
        profile_id: str
    ) -> Optional[Profile]:

        response = (
            supabase
            .table("profiles")
            .select("*")
            .eq("id", profile_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Profile(**response.data[0])

    # --------------------------------------------------
    # UPDATE PROFILE
    # --------------------------------------------------

    def update_profile(
        self,
        profile_id: str,
        data: ProfileUpdate
    ) -> Optional[Profile]:

        updates = data.model_dump(
            exclude_unset=True
        )

        if not updates:
            return self.get_profile(
                profile_id
            )

        response = (
            supabase
            .table("profiles")
            .update(updates)
            .eq("id", profile_id)
            .execute()
        )

        if not response.data:
            return None

        return Profile(**response.data[0])