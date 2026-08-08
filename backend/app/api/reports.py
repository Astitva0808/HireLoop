from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.supabase import supabase

from app.models.report import (
    Report,
    ReportCreate,
    ReportUpdate,
)

from app.services.report_service import (
    ReportService,
)

from app.services.company_service import (
    CompanyService,
)

from app.services.candidate_service import (
    CandidateService,
)


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


report_service = ReportService()
company_service = CompanyService()
candidate_service = CandidateService()


# --------------------------------------------------
# HELPER: GET INTERVIEW
# --------------------------------------------------

def get_interview(
    interview_id: str,
):

    response = (
        supabase
        .table("interviews")
        .select("*")
        .eq(
            "id",
            interview_id,
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# --------------------------------------------------
# CREATE REPORT
# COMPANY ONLY
# --------------------------------------------------

@router.post(
    "",
    response_model=Report,
)
def create_report(
    data: ReportCreate,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can create reports.",
        )

    interview = get_interview(
        data.interview_id
    )

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    # Verify the interview belongs to this company.
    drive_response = (
        supabase
        .table("drives")
        .select("company_id")
        .eq(
            "id",
            interview["drive_id"],
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
            detail="You cannot create a report for another company's interview.",
        )

    # Get relationships from the interview.
    data_dict = data.model_dump()

    data_dict["candidate_id"] = interview[
        "candidate_id"
    ]

    data_dict["drive_id"] = interview[
        "drive_id"
    ]

    report_data = ReportCreate(
        **data_dict
    )

    try:

        return report_service.create_report(
            report_data
        )

    except ValueError as error:

        raise HTTPException(
            status_code=409,
            detail=str(error),
        )


# --------------------------------------------------
# GET MY REPORTS
# CANDIDATE
# --------------------------------------------------

@router.get(
    "/me",
    response_model=List[Report],
)
def get_my_reports(
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

    return report_service.get_candidate_reports(
        candidate.id
    )


# --------------------------------------------------
# GET DRIVE REPORTS
# COMPANY
# --------------------------------------------------

@router.get(
    "/drive/{drive_id}",
    response_model=List[Report],
)
def get_drive_reports(
    drive_id: str,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can view reports.",
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
            detail="You cannot view reports for another company's drive.",
        )

    return report_service.get_drive_reports(
        drive_id
    )


# --------------------------------------------------
# GET REPORT
# --------------------------------------------------

@router.get(
    "/{report_id}",
    response_model=Report,
)
def get_report(
    report_id: str,
    current_user=Depends(get_current_user),
):

    report = report_service.get_report(
        report_id
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    # Candidate can access their own report.
    candidate = candidate_service.get_candidate_by_user(
        str(current_user.id)
    )

    if (
        candidate
        and report.candidate_id == candidate.id
    ):
        return report

    # Company can access reports for its own drives.
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
                report.drive_id,
            )
            .limit(1)
            .execute()
        )

        if (
            drive_response.data
            and drive_response.data[0]["company_id"]
            == company.id
        ):
            return report

    raise HTTPException(
        status_code=403,
        detail="You do not have access to this report.",
    )


# --------------------------------------------------
# UPDATE REPORT
# COMPANY ONLY
# --------------------------------------------------

@router.patch(
    "/{report_id}",
    response_model=Report,
)
def update_report(
    report_id: str,
    data: ReportUpdate,
    current_user=Depends(get_current_user),
):

    company = company_service.get_company_by_owner(
        str(current_user.id)
    )

    if company is None:
        raise HTTPException(
            status_code=403,
            detail="Only companies can update reports.",
        )

    report = report_service.get_report(
        report_id
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    drive_response = (
        supabase
        .table("drives")
        .select("company_id")
        .eq(
            "id",
            report.drive_id,
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
            detail="You cannot update another company's report.",
        )

    updated = report_service.update_report(
        report_id,
        data,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    return updated