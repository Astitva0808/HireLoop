from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user

from app.models.drive import (
    Drive,
    DriveCreate,
    DriveUpdate,
)

from app.services.drive_service import (
    DriveService,
)

from app.services.company_service import (
    CompanyService,
)


router = APIRouter(
    prefix="/api/drives",
    tags=["Drives"],
)


drive_service = DriveService()
company_service = CompanyService()


# --------------------------------------------------
# GET OPEN DRIVES
# --------------------------------------------------

@router.get(
    "/open",
    response_model=List[Drive],
)
def get_open_drives(
    current_user=Depends(get_current_user),
):

    return drive_service.get_open_drives()


# --------------------------------------------------
# CREATE DRIVE
# COMPANY ONLY
# --------------------------------------------------

@router.post(
    "",
    response_model=Drive,
)
def create_drive(
    data: DriveCreate,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only company accounts can create drives.",
        )

    data_dict = data.model_dump()

    # Never trust company_id from frontend.
    data_dict["company_id"] = company.id

    drive_data = DriveCreate(
        **data_dict
    )

    return drive_service.create_drive(
        drive_data
    )


# --------------------------------------------------
# GET MY COMPANY DRIVES
# --------------------------------------------------

@router.get(
    "/my",
    response_model=List[Drive],
)
def get_my_drives(
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only company accounts can access company drives.",
        )

    return drive_service.get_company_drives(
        company.id
    )


# --------------------------------------------------
# GET DRIVE
# --------------------------------------------------

@router.get(
    "/{drive_id}",
    response_model=Drive,
)
def get_drive(
    drive_id: str,
    current_user=Depends(get_current_user),
):

    drive = drive_service.get_drive(
        drive_id
    )

    if drive is None:
        raise HTTPException(
            status_code=404,
            detail="Drive not found.",
        )

    return drive


# --------------------------------------------------
# UPDATE DRIVE
# COMPANY ONLY
# --------------------------------------------------

@router.patch(
    "/{drive_id}",
    response_model=Drive,
)
def update_drive(
    drive_id: str,
    data: DriveUpdate,
    current_user=Depends(get_current_user),
):

    drive = drive_service.get_drive(
        drive_id
    )

    if drive is None:
        raise HTTPException(
            status_code=404,
            detail="Drive not found.",
        )

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only company accounts can update drives.",
        )

    if drive.company_id != company.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot update another company's drive.",
        )

    updated = drive_service.update_drive(
        drive_id,
        data,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Drive not found.",
        )

    return updated


# --------------------------------------------------
# DELETE DRIVE
# COMPANY ONLY
# --------------------------------------------------

@router.delete(
    "/{drive_id}",
)
def delete_drive(
    drive_id: str,
    current_user=Depends(get_current_user),
):

    drive = drive_service.get_drive(
        drive_id
    )

    if drive is None:
        raise HTTPException(
            status_code=404,
            detail="Drive not found.",
        )

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only company accounts can delete drives.",
        )

    if drive.company_id != company.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot delete another company's drive.",
        )

    deleted = drive_service.delete_drive(
        drive_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Drive not found.",
        )

    return {
        "message": "Drive deleted successfully"
    }