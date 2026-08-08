from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import supabase

from app.models.candidate import (
    Candidate,
    CandidateCreate,
    CandidateUpdate,
)

from app.services.candidate_service import (
    CandidateService,
)

from app.services.company_service import (
    CompanyService,
)


router = APIRouter(
    prefix="/api/candidates",
    tags=["Candidates"],
)


candidate_service = CandidateService()
company_service = CompanyService()


# --------------------------------------------------
# HELPER: GET CURRENT CANDIDATE
# --------------------------------------------------

def get_current_candidate(
    user_id: str,
):
    return candidate_service.get_candidate_by_user(
        user_id
    )


# --------------------------------------------------
# GET MY PROFILE
# --------------------------------------------------

@router.get(
    "/me",
    response_model=Candidate,
)
def get_my_candidate(
    current_user=Depends(get_current_user),
):

    candidate = get_current_candidate(
        str(current_user.id)
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found.",
        )

    return candidate


# --------------------------------------------------
# CREATE CANDIDATE
# --------------------------------------------------

@router.post(
    "",
    response_model=Candidate,
)
def create_candidate(
    data: CandidateCreate,
    current_user=Depends(get_current_user),
):

    user_id = str(current_user.id)

    data_dict = data.model_dump()

    # Never trust user_id from frontend.
    data_dict["user_id"] = user_id

    candidate_data = CandidateCreate(
        **data_dict
    )

    try:
        return candidate_service.create_candidate(
            candidate_data
        )

    except ValueError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


# --------------------------------------------------
# UPDATE MY PROFILE
# --------------------------------------------------

@router.patch(
    "/me",
    response_model=Candidate,
)
def update_my_candidate(
    data: CandidateUpdate,
    current_user=Depends(get_current_user),
):

    candidate = get_current_candidate(
        str(current_user.id)
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found.",
        )

    updated = candidate_service.update_candidate(
        candidate.id,
        data,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found.",
        )

    return updated


# --------------------------------------------------
# GET ALL CANDIDATES
# COMPANY ONLY
# --------------------------------------------------

@router.get(
    "",
    response_model=List[Candidate],
)
def get_candidates(
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can view candidates.",
        )

    return candidate_service.get_all_candidates()


# --------------------------------------------------
# GET CANDIDATE BY ID
# COMPANY ONLY
# --------------------------------------------------

@router.get(
    "/{candidate_id}",
    response_model=Candidate,
)
def get_candidate(
    candidate_id: str,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can view candidate profiles.",
        )

    candidate = candidate_service.get_candidate(
        candidate_id
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found.",
        )

    return candidate