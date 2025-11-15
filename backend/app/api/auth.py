from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel
from app.services.auth_service import AuthService
from app.schemas.user import Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


class GoogleAuthRequest(BaseModel):
    token: str


class AppleAuthRequest(BaseModel):
    token: str


@router.post("/google", response_model=Token)
async def google_auth(request: GoogleAuthRequest = Body(...)):
    """Authenticate with Google OAuth"""
    auth_service = AuthService()

    # Verify Google token
    user_data = await auth_service.verify_google_token(request.token)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

    # Get or create user
    user = await auth_service.get_or_create_user(user_data, "google")

    # Create tokens
    tokens = await auth_service.create_tokens(str(user.id))

    return tokens


@router.post("/apple", response_model=Token)
async def apple_auth(request: AppleAuthRequest = Body(...)):
    """Authenticate with Apple OAuth"""
    auth_service = AuthService()

    # Verify Apple token
    user_data = await auth_service.verify_apple_token(request.token)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Apple token"
        )

    # Get or create user
    user = await auth_service.get_or_create_user(user_data, "apple")

    # Create tokens
    tokens = await auth_service.create_tokens(str(user.id))

    return tokens


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    """Refresh access token"""
    from app.core.security import decode_token

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    auth_service = AuthService()
    tokens = await auth_service.create_tokens(user_id)

    return tokens
