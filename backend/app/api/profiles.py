from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import supabase
from app.models.profile import (
    Profile,
    ProfileCreate,
    ProfileUpdate,
)

from app.services.profile_service import (
    ProfileService,
)


router = APIRouter(
    prefix="/api/profiles",
    tags=["Profiles"],
)


profile_service = ProfileService()


# --------------------------------------------------
# CREATE PROFILE
# --------------------------------------------------

@router.post(
    "",
    response_model=Profile,
)
def create_profile(
    data: ProfileCreate,
    current_user=Depends(get_current_user),
):

    # Users can only create their own profile.
    if data.id != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="You can only create your own profile.",
        )

    return profile_service.create_profile(
        data
    )


# --------------------------------------------------
# GET CURRENT PROFILE
# --------------------------------------------------

@router.get(
    "/me",
    response_model=Profile,
)
def get_my_profile(
    current_user=Depends(get_current_user),
):

    profile = profile_service.get_profile(
        str(current_user.id)
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found.",
        )

    return profile


# --------------------------------------------------
# UPDATE CURRENT PROFILE
# --------------------------------------------------

@router.patch(
    "/me",
    response_model=Profile,
)
def update_my_profile(
    data: ProfileUpdate,
    current_user=Depends(get_current_user),
):

    profile = profile_service.update_profile(
        str(current_user.id),
        data,
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found.",
        )

    return profile