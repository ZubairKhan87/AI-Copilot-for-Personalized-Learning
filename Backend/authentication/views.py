from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

User = get_user_model()
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

from .models import UserProfile
# views.py
# views.py
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile
from django.db import transaction
import random
import string

# views.py
import logging
logger = logging.getLogger(__name__)
class StudentLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Please provide both username and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # First check if user exists
            user = User.objects.get(username=username)
            
            # Then try to authenticate
            authenticated_user = authenticate(username=username, password=password)
            if authenticated_user is None:
                logger.error(f"Authentication failed for username: {username}")
            if authenticated_user is None:
                return Response({
                    'error': 'Invalid password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get or create profile
            profile, created = UserProfile.objects.get_or_create(user=authenticated_user)
            
            # Check if user is a teacher
            if profile.is_teacher:
                return Response({
                    'error': 'Please use the teacher login page'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Generate tokens
            refresh = RefreshToken.for_user(authenticated_user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'username': authenticated_user.username,
                'is_teacher': False
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'User does not exist'
            }, status=status.HTTP_401_UNAUTHORIZED)

class TeacherLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Please provide both username and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # First check if user exists
            user = User.objects.get(username=username)
            
            # Then try to authenticate
            authenticated_user = authenticate(username=username, password=password)
            
            if authenticated_user is None:
                return Response({
                    'error': 'Invalid password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get or create profile
            profile, created = UserProfile.objects.get_or_create(user=authenticated_user)
            
            # Check if user is a student
            if not profile.is_teacher:
                return Response({
                    'error': 'Please use the student login page'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Generate tokens
            refresh = RefreshToken.for_user(authenticated_user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'username': authenticated_user.username,
                'is_teacher': True
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'User does not exist'
            }, status=status.HTTP_401_UNAUTHORIZED)

from rest_framework_simplejwt.exceptions import TokenError

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logged out successfully"}, 
                status=status.HTTP_200_OK
            )
        except TokenError:
            # Token is already blacklisted or invalid
            return Response(
                {"message": "Logged out successfully"}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )