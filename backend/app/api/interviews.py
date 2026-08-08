from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import supabase

from app.models.interview import (
    Interview,
    InterviewCreate,
    InterviewUpdate,
)

from app.services.interview_service import (
    InterviewService,
)

from app.services.company_service import (
    CompanyService,
)

from app.services.candidate_service import (
    CandidateService,
)


router = APIRouter(
    prefix="/api/interviews",
    tags=["Interviews"],
)


interview_service = InterviewService()
company_service = CompanyService()
candidate_service = CandidateService()


# --------------------------------------------------
# HELPER: GET APPLICATION
# --------------------------------------------------

def get_application(
    application_id: str,
):

    response = (
        supabase
        .table("applications")
        .select("*")
        .eq(
            "id",
            application_id,
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# --------------------------------------------------
# CREATE INTERVIEW
# COMPANY ONLY
# --------------------------------------------------

@router.post(
    "",
    response_model=Interview,
)
def create_interview(
    data: InterviewCreate,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can create interviews.",
        )

    application = get_application(
        data.application_id
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    # Verify that the application belongs to
    # a drive owned by this company.
    drive_response = (
        supabase
        .table("drives")
        .select("company_id")
        .eq(
            "id",
            application["drive_id"],
        )
        .limit(1)
        .execute()
    )

    if not drive_response.data:
        raise HTTPException(
            status_code=404,
            detail="Drive not found.",
        )

    if (
        drive_response.data[0]["company_id"]
        != company.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot create an interview for another company's application.",
        )

    # Always use database relationships instead
    # of trusting these values from the frontend.
    data_dict = data.model_dump()

    data_dict["drive_id"] = application[
        "drive_id"
    ]

    data_dict["candidate_id"] = application[
        "candidate_id"
    ]

    interview_data = InterviewCreate(
        **data_dict
    )

    try:

        return interview_service.create_interview(
            interview_data
        )

    except ValueError as error:

        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


# --------------------------------------------------
# GET MY INTERVIEWS
# CANDIDATE
# --------------------------------------------------

@router.get(
    "/me",
    response_model=List[Interview],
)
def get_my_interviews(
    current_user=Depends(get_current_user),
):

    candidate = candidate_service.get_candidate_by_user(
        str(current_user.id)
    )

    if candidate is None:
        raise HTTPException(
            status_code=403,
            detail="Candidate profile not found.",
        )

    return interview_service.get_candidate_interviews(
        candidate.id
    )


# --------------------------------------------------
# GET DRIVE INTERVIEWS
# COMPANY
# --------------------------------------------------

@router.get(
    "/drive/{drive_id}",
    response_model=List[Interview],
)
def get_drive_interviews(
    drive_id: str,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can view drive interviews.",
        )

    drive_response = (
        supabase
        .table("drives")
        .select("company_id")
        .eq(
            "id",
            drive_id,
        )
        .limit(1)
        .execute()
    )

    if not drive_response.data:
        raise HTTPException(
            status_code=404,
            detail="Drive not found.",
        )

    if (
        drive_response.data[0]["company_id"]
        != company.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot access another company's interviews.",
        )

    return interview_service.get_drive_interviews(
        drive_id
    )


# --------------------------------------------------
# GET INTERVIEW
# --------------------------------------------------

@router.get(
    "/{interview_id}",
    response_model=Interview,
)
def get_interview(
    interview_id: str,
    current_user=Depends(get_current_user),
):

    interview = interview_service.get_interview(
        interview_id
    )

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    candidate = candidate_service.get_candidate_by_user(
        str(current_user.id)
    )

    if candidate and interview.candidate_id == candidate.id:
        return interview

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company:

        drive_response = (
            supabase
            .table("drives")
            .select("company_id")
            .eq(
                "id",
                interview.drive_id,
            )
            .limit(1)
            .execute()
        )

        if (
            drive_response.data
            and drive_response.data[0]["company_id"]
            == company.id
        ):
            return interview

    raise HTTPException(
        status_code=403,
        detail="You do not have access to this interview.",
    )


# --------------------------------------------------
# UPDATE INTERVIEW
# --------------------------------------------------

@router.patch(
    "/{interview_id}",
    response_model=Interview,
)
def update_interview(
    interview_id: str,
    data: InterviewUpdate,
    current_user=Depends(get_current_user),
):

    interview = interview_service.get_interview(
        interview_id
    )

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can update interviews.",
        )

    drive_response = (
        supabase
        .table("drives")
        .select("company_id")
        .eq(
            "id",
            interview.drive_id,
        )
        .limit(1)
        .execute()
    )

    if not drive_response.data:
        raise HTTPException(
            status_code=404,
            detail="Drive not found.",
        )

    if (
        drive_response.data[0]["company_id"]
        != company.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot update another company's interview.",
        )

    updated = interview_service.update_interview(
        interview_id,
        data,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    return updated