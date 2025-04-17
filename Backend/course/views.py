from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Course
from .serializers import CourseRegistrationSerializer
# Create your views here.
class CourseRegistrationView(APIView):
    permission_classes = [IsAuthenticated]
    print("request aa gie hai yahan")
    def post(self, request):
        serializer = CourseRegistrationSerializer(data=request.data, context={'request': request})
        print("got a data ",serializer)
        if serializer.is_valid():
            course = serializer.save()
            
            # Add the job URL to the response
            response_data = serializer.data
            # response_data['share_url'] = f"{settings.FRONTEND_URL}/jobs/{course.id}/apply"
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        register_course = Course.objects.all()  # Add this method
        serializer = CourseRegistrationSerializer(register_course, many=True)
        return Response(serializer.data)