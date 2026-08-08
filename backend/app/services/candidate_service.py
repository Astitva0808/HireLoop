from typing import List, Optional

from app.core.supabase import supabase

from app.models.candidate import (
    Candidate,
    CandidateCreate,
    CandidateUpdate,
)


class CandidateService:

    # --------------------------------------------------
    # CREATE CANDIDATE
    # --------------------------------------------------

    def create_candidate(
        self,
        data: CandidateCreate,
    ) -> Candidate:

        existing = (
            supabase
            .table("candidates")
            .select("*")
            .eq("user_id", data.user_id)
            .limit(1)
            .execute()
        )

        if existing.data:
            return Candidate(**existing.data[0])

        response = (
            supabase
            .table("candidates")
            .insert(
                data.model_dump()
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create candidate."
            )

        return Candidate(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET CANDIDATE
    # --------------------------------------------------

    def get_candidate(
        self,
        candidate_id: str,
    ) -> Optional[Candidate]:

        response = (
            supabase
            .table("candidates")
            .select("*")
            .eq("id", candidate_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Candidate(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET CANDIDATE BY USER ID
    # --------------------------------------------------

    def get_candidate_by_user(
        self,
        user_id: str,
    ) -> Optional[Candidate]:

        response = (
            supabase
            .table("candidates")
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return Candidate(
            **response.data[0]
        )

    # --------------------------------------------------
    # GET ALL CANDIDATES
    # --------------------------------------------------

    def get_all_candidates(
        self,
    ) -> List[Candidate]:

        response = (
            supabase
            .table("candidates")
            .select("*")
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        return [
            Candidate(**candidate)
            for candidate in response.data
        ]

    # --------------------------------------------------
    # UPDATE CANDIDATE
    # --------------------------------------------------

    def update_candidate(
        self,
        candidate_id: str,
        data: CandidateUpdate,
    ) -> Optional[Candidate]:

        updates = data.model_dump(
            exclude_unset=True
        )

        if not updates:
            return self.get_candidate(
                candidate_id
            )

        response = (
            supabase
            .table("candidates")
            .update(updates)
            .eq("id", candidate_id)
            .execute()
        )

        if not response.data:
            return None

        return Candidate(
            **response.data[0]
        )

    # --------------------------------------------------
    # DELETE CANDIDATE
    # --------------------------------------------------

    def delete_candidate(
        self,
        candidate_id: str,
    ) -> bool:

        response = (
            supabase
            .table("candidates")
            .delete()
            .eq("id", candidate_id)
            .execute()
        )

        return bool(response.data)