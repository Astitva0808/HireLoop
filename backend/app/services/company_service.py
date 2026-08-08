from typing import List, Optional

from app.core.supabase import supabase
from app.models.company import (
    Company,
    CompanyCreate,
    CompanyUpdate,
)


class CompanyService:

    # --------------------------------------------------
    # CREATE COMPANY
    # --------------------------------------------------

    def create_company(
        self,
        data: CompanyCreate,
    ) -> Company:

        existing = (
            supabase
            .table("companies")
            .select("id")
            .eq("email", data.email.lower())
            .limit(1)
            .execute()
        )

        if existing.data:
            raise ValueError(
                "A company with this email already exists."
            )

        payload = data.model_dump()

        payload["email"] = data.email.lower()

        response = (
            supabase
            .table("companies")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create company."
            )

        return Company(**response.data[0])

    # --------------------------------------------------
    # GET COMPANY
    # --------------------------------------------------

    def get_company(
        self,
        company_id: str,
        owner_id: str,
    ) -> Optional[Company]:

        response = (
            supabase
            .table("companies")
            .select("*")
            .eq("id", company_id)
            .eq("owner_id", owner_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Company(**response.data[0])

    # --------------------------------------------------
    # GET CURRENT COMPANY
    # --------------------------------------------------

    def get_company_by_owner(
        self,
        owner_id: str,
    ) -> Optional[Company]:

        response = (
            supabase
            .table("companies")
            .select("*")
            .eq("owner_id", owner_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Company(**response.data[0])

    # --------------------------------------------------
    # GET COMPANY BY EMAIL
    # --------------------------------------------------

    def get_company_by_email(
        self,
        email: str,
        owner_id: str,
    ) -> Optional[Company]:

        response = (
            supabase
            .table("companies")
            .select("*")
            .eq("email", email.lower())
            .eq("owner_id", owner_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Company(**response.data[0])

    # --------------------------------------------------
    # GET ALL COMPANIES
    # --------------------------------------------------

    def get_my_companies(
        self,
        owner_id: str,
    ) -> List[Company]:

        response = (
            supabase
            .table("companies")
            .select("*")
            .eq("owner_id", owner_id)
            .order("created_at", desc=True)
            .execute()
        )

        return [
            Company(**company)
            for company in response.data
        ]

    # --------------------------------------------------
    # UPDATE COMPANY
    # --------------------------------------------------

    def update_company(
        self,
        company_id: str,
        owner_id: str,
        data: CompanyUpdate,
    ) -> Optional[Company]:

        updates = data.model_dump(
            exclude_unset=True
        )

        if not updates:
            return self.get_company(
                company_id,
                owner_id,
            )

        if "email" in updates:
            updates["email"] = (
                updates["email"].lower()
            )

            existing = (
                supabase
                .table("companies")
                .select("id")
                .eq("email", updates["email"])
                .neq("id", company_id)
                .limit(1)
                .execute()
            )

            if existing.data:
                raise ValueError(
                    "Another company already uses this email."
                )

        response = (
            supabase
            .table("companies")
            .update(updates)
            .eq("id", company_id)
            .eq("owner_id", owner_id)
            .execute()
        )

        if not response.data:
            return None

        return Company(**response.data[0])

    # --------------------------------------------------
    # DELETE COMPANY
    # --------------------------------------------------

    def delete_company(
        self,
        company_id: str,
        owner_id: str,
    ) -> bool:

        response = (
            supabase
            .table("companies")
            .delete()
            .eq("id", company_id)
            .eq("owner_id", owner_id)
            .execute()
        )

        return bool(response.data)