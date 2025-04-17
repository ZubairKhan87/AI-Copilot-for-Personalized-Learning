# In urls.py for authentication app
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    LogoutView, 
    StudentLoginView,
    TeacherLoginView,

)
from django.urls import path
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

urlpatterns = [
    path('student/', StudentLoginView.as_view(), name='token_obtain_pair'),
    path('teacher/', TeacherLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

]