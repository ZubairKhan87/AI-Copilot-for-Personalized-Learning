from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Course
from .serializers import CourseRegistrationSerializer
from authentication.models import TeacherTable
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
        user= request.user
        print("user",user)
        teacher = TeacherTable.objects.get(teacher=user)
        register_course = Course.objects.filter(teacher=teacher)
        print("register course",register_course)
        if not register_course:
            return Response({"message": "No courses found for this teacher"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CourseRegistrationSerializer(register_course, many=True)
        return Response(serializer.data)
    



# views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Attachment, TimeStamp, Course
from .serializers import AttachmentSerializer, TimeStampSerializer

class UploadMaterialView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        print("attachment upload krny ke request aagie hai")
        # Get the course from the request data
        course_id = request.data.get('course_id')
        print("course id",course_id)
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create the timestamp/week
        week_name = request.data.get('week_name', 'Week 1')  # Default to Week 1 if not provided
        timestamp, created = TimeStamp.objects.get_or_create(week_name=week_name)
        
        # Create attachment data
        attachment_data = {
            'course': course.id,
            'weak': timestamp.id,
            'attachment_name': request.data.get('title'),
            'attachment_description': request.data.get('description', ''),
            'attachment_file': request.FILES.get('file')
        }
        print("attachment data",attachment_data)
        serializer = AttachmentSerializer(data=attachment_data)
        if serializer.is_valid():
            attachment = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TimeStampListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        timestamps = TimeStamp.objects.all()
        serializer = TimeStampSerializer(timestamps, many=True)
        return Response(serializer.data)


# views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Course, Attachment
from .serializers import AttachmentSerializer

class CourseMaterialsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, course_id, format=None):
        try:
            # Check if course exists and user has access
            course = Course.objects.get(id=course_id)
            
            # Get all attachments for this course
            attachments = Attachment.objects.filter(course=course).select_related('weak')
            serializer = AttachmentSerializer(attachments, many=True)
            return Response(serializer.data)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)