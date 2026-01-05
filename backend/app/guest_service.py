import uuid
import json
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlmodel import Session, select, delete

from app.core.config import settings
from app.core.db import engine
from app.core.security import create_access_token
from app.models import User, GuestReport, GuestType, GuestCreate, GuestResponse
from app.utils import send_email


def create_guest_user(email: str | None = None) -> tuple[User, str]:
    """
    Create a new guest user and return user object with access token
    
    Args:
        email: Optional email address for the guest
        
    Returns:
        Tuple of (User object, JWT token string)
    """
    guest_session_id = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.GUEST_SESSION_HOURS)
    
    guest_type = GuestType.EMAIL if email else GuestType.ANONYMOUS
    
    # Create guest user
    guest_user = User(
        email=email or f"guest-{guest_session_id}@classim.local",
        guest_email=email,  # Store original email separately
        full_name="Guest User",
        is_guest=True,
        guest_session_id=guest_session_id,
        guest_type=guest_type,
        expires_at=expires_at,
        is_active=True
    )
    
    with Session(engine) as session:
        session.add(guest_user)
        session.commit()
        session.refresh(guest_user)
        
        # Generate JWT token for guest (24 hour expiration)
        token = create_access_token(
            subject=str(guest_user.id),
            expires_delta=timedelta(hours=settings.GUEST_SESSION_HOURS)
        )
        
        return guest_user, token


def add_email_to_guest(guest_user_id: int, email: str) -> bool:
    """
    Add email address to an existing anonymous guest user
    
    Args:
        guest_user_id: ID of the guest user
        email: Email address to add
        
    Returns:
        True if successful, False if user not found or not a guest
    """
    with Session(engine) as session:
        guest = session.get(User, guest_user_id)
        
        if not guest or not guest.is_guest:
            return False
            
        guest.guest_email = email
        guest.guest_type = GuestType.EMAIL
        session.commit()
        
        return True


async def send_report_to_guest(guest_user_id: int, report_data: dict, report_type: str) -> bool:
    """
    Generate and send report via email to guest user
    
    Args:
        guest_user_id: ID of the guest user
        report_data: Dictionary containing the report data
        report_type: Type of report (e.g., "simulation", "analysis")
        
    Returns:
        True if successful, False if failed
    """
    with Session(engine) as session:
        guest = session.get(User, guest_user_id)
        
        if not guest or not guest.is_guest or not guest.guest_email:
            return False
            
        # Check report limit
        existing_reports = session.exec(
            select(GuestReport).where(
                GuestReport.guest_user_id == guest_user_id,
                GuestReport.email_sent == True
            )
        ).all()
        
        if len(existing_reports) >= settings.GUEST_MAX_REPORTS:
            raise ValueError(f"Guest has exceeded maximum reports limit ({settings.GUEST_MAX_REPORTS})")
        
        # Create report record
        report = GuestReport(
            guest_user_id=guest_user_id,
            report_type=report_type,
            report_data=json.dumps(report_data)
        )
        session.add(report)
        session.commit()
        session.refresh(report)
        
        # Send email
        success = await send_guest_report_email(
            guest.guest_email, 
            report_data, 
            report_type,
            guest.full_name or "Guest User"
        )
        
        if success:
            # Mark as sent
            report.email_sent = True
            report.email_sent_at = datetime.now(timezone.utc)
            session.commit()
            
        return success


async def send_guest_report_email(
    email: str, 
    report_data: dict, 
    report_type: str, 
    guest_name: str
) -> bool:
    """
    Send the actual email with report data
    
    Args:
        email: Email address to send to
        report_data: Report data dictionary
        report_type: Type of report
        guest_name: Name to use in email
        
    Returns:
        True if email sent successfully
    """
    try:
        subject = f"Your CLASSIM {report_type.title()} Report"
        
        # Create email body (you can customize this)
        email_body = f"""
        Hello {guest_name},
        
        Thank you for using CLASSIM! Your {report_type} report is ready.
        
        Report Summary:
        - Report Type: {report_type.title()}
        - Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC
        - Data Points: {len(report_data)} items
        
        Report Data:
        {json.dumps(report_data, indent=2)}
        
        Best regards,
        The CLASSIM Team
        USDA Agricultural Research Service
        
        ---
        This is an automated message from the CLASSIM system.
        """
        
        # Use your existing email sending function
        await send_email(
            email_to=email,
            subject_template=subject,
            html_template=email_body,
            environment={
                "guest_name": guest_name,
                "report_type": report_type,
                "report_data": report_data
            }
        )
        
        return True
        
    except Exception as e:
        print(f"Failed to send guest report email: {e}")
        return False


def get_guest_reports(guest_user_id: int) -> list[GuestReport]:
    """
    Get all reports for a guest user
    
    Args:
        guest_user_id: ID of the guest user
        
    Returns:
        List of GuestReport objects
    """
    with Session(engine) as session:
        reports = session.exec(
            select(GuestReport).where(
                GuestReport.guest_user_id == guest_user_id
            ).order_by(GuestReport.generated_at.desc())
        ).all()
        
        return list(reports)


def cleanup_expired_guests() -> int:
    """
    Clean up expired guest users and their associated data
    
    Returns:
        Number of guest users cleaned up
    """
    with Session(engine) as session:
        # Find expired guest users
        expired_guests = session.exec(
            select(User).where(
                User.is_guest == True,
                User.expires_at < datetime.now(timezone.utc)
            )
        ).all()
        
        cleanup_count = 0
        
        for guest in expired_guests:
            # Delete associated reports (should cascade)
            session.exec(
                delete(GuestReport).where(GuestReport.guest_user_id == guest.id)
            )
            
            # Delete guest user
            session.delete(guest)
            cleanup_count += 1
        
        session.commit()
        
        return cleanup_count


def is_guest_session_valid(guest_user_id: int) -> bool:
    """
    Check if a guest session is still valid (not expired)
    
    Args:
        guest_user_id: ID of the guest user
        
    Returns:
        True if session is valid, False if expired or not found
    """
    with Session(engine) as session:
        guest = session.get(User, guest_user_id)
        
        if not guest or not guest.is_guest:
            return False
            
        if guest.expires_at and guest.expires_at < datetime.now(timezone.utc):
            return False
            
        return True