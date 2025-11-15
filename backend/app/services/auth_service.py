from datetime import datetime
from typing import Optional
from google.auth.transport import requests
from google.oauth2 import id_token
import httpx
import jwt as pyjwt
from bson import ObjectId

from app.core import get_database, create_access_token, create_refresh_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, Token


class AuthService:
    def __init__(self):
        self.db = get_database()

    async def verify_google_token(self, token: str) -> Optional[dict]:
        """Verify Google OAuth token"""
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            return {
                'email': idinfo['email'],
                'name': idinfo.get('name'),
                'picture': idinfo.get('picture'),
                'google_id': idinfo['sub']
            }
        except Exception as e:
            print(f"Error verifying Google token: {e}")
            return None

    async def verify_apple_token(self, token: str) -> Optional[dict]:
        """Verify Apple OAuth token"""
        try:
            # Decode the token header to get the key id
            header = pyjwt.get_unverified_header(token)

            # Fetch Apple's public keys
            async with httpx.AsyncClient() as client:
                response = await client.get('https://appleid.apple.com/auth/keys')
                keys = response.json()['keys']

            # Find the matching key
            public_key = None
            for key in keys:
                if key['kid'] == header['kid']:
                    public_key = pyjwt.algorithms.RSAAlgorithm.from_jwk(key)
                    break

            if not public_key:
                return None

            # Verify the token
            payload = pyjwt.decode(
                token,
                public_key,
                audience=settings.APPLE_CLIENT_ID,
                algorithms=['RS256']
            )

            return {
                'email': payload.get('email'),
                'apple_id': payload['sub']
            }
        except Exception as e:
            print(f"Error verifying Apple token: {e}")
            return None

    async def get_or_create_user(self, user_data: dict, provider: str) -> User:
        """Get existing user or create new one"""
        email = user_data['email']

        # Check if user exists
        user_doc = await self.db.users.find_one({'email': email})

        if user_doc:
            # Update last login
            await self.db.users.update_one(
                {'_id': user_doc['_id']},
                {'$set': {'last_login': datetime.utcnow()}}
            )
            return User(**user_doc)

        # Create new user
        new_user = UserCreate(
            email=email,
            full_name=user_data.get('name'),
            profile_picture=user_data.get('picture'),
            auth_provider=provider,
            google_id=user_data.get('google_id'),
            apple_id=user_data.get('apple_id')
        )

        user_dict = new_user.model_dump()
        user_dict['created_at'] = datetime.utcnow()
        user_dict['updated_at'] = datetime.utcnow()
        user_dict['last_login'] = datetime.utcnow()
        user_dict['is_active'] = True
        user_dict['notification_preferences'] = {
            'email_notifications': True,
            'in_app_notifications': True,
            'notification_time_before': 24
        }

        result = await self.db.users.insert_one(user_dict)
        user_dict['_id'] = result.inserted_id

        return User(**user_dict)

    async def create_tokens(self, user_id: str) -> Token:
        """Create access and refresh tokens"""
        access_token = create_access_token(data={"sub": user_id})
        refresh_token = create_refresh_token(data={"sub": user_id})

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            user_doc = await self.db.users.find_one({'_id': ObjectId(user_id)})
            if user_doc:
                return User(**user_doc)
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
