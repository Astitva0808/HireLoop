from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user

from app.models.settings import (
    Settings,
    SettingsCreate,
    SettingsUpdate,
)

from app.services.settings_service import (
    SettingsService,
)


router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"],
)


settings_service = SettingsService()


# --------------------------------------------------
# CREATE SETTINGS
# --------------------------------------------------

@router.post(
    "",
    response_model=Settings,
)
def create_settings(
    data: SettingsCreate,
    current_user=Depends(get_current_user),
):

    try:

        return settings_service.create_settings(
            data
        )

    except ValueError as error:

        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


# --------------------------------------------------
# GET SETTINGS
# --------------------------------------------------

@router.get(
    "/company/{company_id}",
    response_model=Settings,
)
def get_settings(
    company_id: str,
    current_user=Depends(get_current_user),
):

    settings = settings_service.get_settings(
        company_id
    )

    if settings is None:

        raise HTTPException(
            status_code=404,
            detail="Settings not found",
        )

    return settings


# --------------------------------------------------
# UPDATE SETTINGS
# --------------------------------------------------

@router.patch(
    "/company/{company_id}",
    response_model=Settings,
)
def update_settings(
    company_id: str,
    data: SettingsUpdate,
    current_user=Depends(get_current_user),
):

    settings = settings_service.update_settings(
        company_id,
        data,
    )

    if settings is None:

        raise HTTPException(
            status_code=404,
            detail="Settings not found",
        )

    return settings