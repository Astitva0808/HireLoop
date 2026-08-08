from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user

from app.services.analytics_service import (
    AnalyticsService,
)

from app.services.company_service import (
    CompanyService,
)


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


analytics_service = AnalyticsService()
company_service = CompanyService()


# --------------------------------------------------
# COMPANY ANALYTICS
# --------------------------------------------------

@router.get(
    "/company",
    response_model=Dict[str, Any],
)
def get_company_analytics(
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only company accounts can access analytics.",
        )

    return analytics_service.get_company_analytics(
        company.id
    )