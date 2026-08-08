from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import supabase

from app.models.company import (
    Company,
    CompanyCreate,
    CompanyUpdate,
)

from app.services.company_service import (
    CompanyService,
)


router = APIRouter(
    prefix="/api/company",
    tags=["Company"],
)


company_service = CompanyService()


# --------------------------------------------------
# CREATE COMPANY
# --------------------------------------------------

@router.post(
    "",
    response_model=Company,
)
def create_company(
    data: CompanyCreate,
    current_user=Depends(get_current_user),
):

    data_dict = data.model_dump()

    data_dict["owner_id"] = str(
        current_user.id
    )

    company_data = CompanyCreate(
        **data_dict
    )

    try:

        return company_service.create_company(
            company_data
        )

    except ValueError as error:

        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


# --------------------------------------------------
# GET MY COMPANY
# --------------------------------------------------

@router.get(
    "/me",
    response_model=Company,
)
def get_my_company(
    current_user=Depends(get_current_user),
):

    company = (
        company_service.get_company_by_owner(
            str(current_user.id)
        )
    )

    if company is None:

        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    return company


# --------------------------------------------------
# GET ALL MY COMPANIES
# --------------------------------------------------

@router.get(
    "",
    response_model=List[Company],
)
def get_companies(
    current_user=Depends(get_current_user),
):

    return company_service.get_my_companies(
        str(current_user.id)
    )


# --------------------------------------------------
# GET COMPANY BY EMAIL
# --------------------------------------------------

@router.get(
    "/email/{email}",
    response_model=Company,
)
def get_company_by_email(
    email: str,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_email(
        email,
        str(current_user.id),
    )

    if company is None:

        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    return company


# --------------------------------------------------
# GET COMPANY
# --------------------------------------------------

@router.get(
    "/{company_id}",
    response_model=Company,
)
def get_company(
    company_id: str,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company(
        company_id,
        str(current_user.id),
    )

    if company is None:

        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    return company


# --------------------------------------------------
# UPDATE COMPANY
# --------------------------------------------------

@router.patch(
    "/{company_id}",
    response_model=Company,
)
def update_company(
    company_id: str,
    data: CompanyUpdate,
    current_user=Depends(get_current_user),
):

    try:

        company = company_service.update_company(
            company_id,
            str(current_user.id),
            data,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=409,
            detail=str(error),
        )

    if company is None:

        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    return company


# --------------------------------------------------
# DELETE COMPANY
# --------------------------------------------------

@router.delete(
    "/{company_id}",
)
def delete_company(
    company_id: str,
    current_user=Depends(get_current_user),
):

    deleted = company_service.delete_company(
        company_id,
        str(current_user.id),
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    return {
        "message": "Company deleted successfully"
    }