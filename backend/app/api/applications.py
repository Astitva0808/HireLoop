from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import supabase

from app.models.application import (
    Application,
    ApplicationCreate,
    ApplicationUpdate,
)

from app.services.application_service import (
    ApplicationService,
)

from app.services.company_service import (
    CompanyService,
)


router = APIRouter(
    prefix="/api/applications",
    tags=["Applications"],
)


application_service = ApplicationService()
company_service = CompanyService()


# --------------------------------------------------
# HELPER: GET CANDIDATE
# --------------------------------------------------

def get_candidate(
    user_id: str,
):
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

    return response.data[0]


# --------------------------------------------------
# APPLY TO DRIVE
# --------------------------------------------------

@router.post(
    "",
    response_model=Application,
)
def apply_to_drive(
    data: ApplicationCreate,
    current_user=Depends(get_current_user),
):

    candidate = get_candidate(
        str(current_user.id)
    )

    if candidate is None:
        raise HTTPException(
            status_code=403,
            detail="Only candidates can apply to drives.",
        )

    try:

        return application_service.create_application(
            candidate_id=candidate["id"],
            data=data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


# --------------------------------------------------
# GET MY APPLICATIONS
# --------------------------------------------------

@router.get(
    "/me",
    response_model=List[Application],
)
def get_my_applications(
    current_user=Depends(get_current_user),
):

    candidate = get_candidate(
        str(current_user.id)
    )

    if candidate is None:
        raise HTTPException(
            status_code=403,
            detail="Candidate profile not found.",
        )

    return application_service.get_candidate_applications(
        candidate["id"]
    )


# --------------------------------------------------
# GET APPLICATION
# --------------------------------------------------

@router.get(
    "/{application_id}",
    response_model=Application,
)
def get_application(
    application_id: str,
    current_user=Depends(get_current_user),
):

    application = (
        application_service.get_application(
            application_id
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    return application


# --------------------------------------------------
# GET DRIVE APPLICATIONS
# COMPANY ONLY
# --------------------------------------------------

@router.get(
    "/drive/{drive_id}",
    response_model=List[Application],
)
def get_drive_applications(
    drive_id: str,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can view applications.",
        )

    # Verify drive belongs to this company
    drive_response = (
        supabase
        .table("drives")
        .select("company_id")
        .eq("id", drive_id)
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
            detail="You cannot view applications for another company's drive.",
        )

    return application_service.get_drive_applications(
        drive_id
    )


# --------------------------------------------------
# UPDATE APPLICATION
# COMPANY ONLY
# --------------------------------------------------

@router.patch(
    "/{application_id}",
    response_model=Application,
)
def update_application(
    application_id: str,
    data: ApplicationUpdate,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can update applications.",
        )

    application = (
        application_service.get_application(
            application_id
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    # Verify the application belongs to this company's drive
    drive_response = (
        supabase
        .table("drives")
        .select("company_id")
        .eq("id", application.drive_id)
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
            detail="You cannot update another company's application.",
        )

    updated = application_service.update_application(
        application_id,
        data,
    )

    return updated


# --------------------------------------------------
# DELETE APPLICATION
# --------------------------------------------------

@router.delete(
    "/{application_id}",
)
def delete_application(
    application_id: str,
    current_user=Depends(get_current_user),
):

    candidate = get_candidate(
        str(current_user.id)
    )

    if candidate is None:
        raise HTTPException(
            status_code=403,
            detail="Only candidates can delete applications.",
        )

    application = (
        application_service.get_application(
            application_id
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    if application.candidate_id != candidate["id"]:
        raise HTTPException(
            status_code=403,
            detail="You cannot delete another candidate's application.",
        )

    deleted = (
        application_service.delete_application(
            application_id
        )
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    return {
        "message": "Application withdrawn successfully"
    }