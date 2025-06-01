from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Course,CourseRegistration
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
        # registered_students = CourseRegistration.objects.filter(course__in=register_course)
        # print("Total registered students",len(registered_students))
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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Max
from .models import CourseRegistration, StudentPerformance, CourseQuiz
from authentication.models import TeacherTable

class StudentPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        # Ensure the user is a teacher
        try:
            teacher = TeacherTable.objects.get(teacher=request.user)
        except TeacherTable.DoesNotExist:
            return Response({'detail': 'Teacher not found.'}, status=404)

        # Retrieve courses taught by the teacher
        courses = teacher.courses.filter(id=course_id)
        print("coursesss",courses)
        # Prepare the response data
        response_data = []

        for course in courses:
            print("course in loop",course)
            # Get all students registered in the course
            registrations = CourseRegistration.objects.filter(course=course).select_related('student')
            print("registrations",registrations)
            # Get all quizzes for the course
            # Get all quizzes related to this course
            course_quizzes = CourseQuiz.objects.filter(course=course)
            print("course_quizzes",course_quizzes)
            # Loop through each registration in the course
            for registration in registrations:
                student = registration.student
                print(student)
                # Now fetch performances only for this course's quizzes
                performances = StudentPerformance.objects.filter(
                    student=student,
                    quiz__in=course_quizzes
                )
                print(performances)
                avg_score = performances.aggregate(avg=Avg('quiz_score'))['avg'] or 0.0
                quizzes_taken = performances.count()
                last_active = performances.aggregate(last=Max('quiz__quiz_date'))['last']

                progress = (quizzes_taken / course_quizzes.count()) * 100 if course_quizzes.count() > 0 else 0.0

                response_data.append({
                    'name': student.student_name,
                    'progress': round(progress, 2),
                    'avgScore': round(avg_score, 2),
                    'quizzesTaken': quizzes_taken,
                    'lastActive': last_active
                })
            return Response(response_data, status=200)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg
from .models import Course, CourseQuiz, CourseRegistration, StudentPerformance, Attachment

class CourseStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id, teacher__teacher=request.user)

            # Total registered students
            total_students = CourseRegistration.objects.filter(course=course).count()

            # Total quizzes for this course
            total_quizzes = CourseQuiz.objects.filter(course=course).count()

            # Get all quizzes for this course
            course_quizzes = CourseQuiz.objects.filter(course=course)

            # Total quiz attempts (i.e., StudentPerformance)
            total_attempts = StudentPerformance.objects.filter(quiz__in=course_quizzes).count()

            # Overall average quiz score across all attempts
            average_score = StudentPerformance.objects.filter(quiz__in=course_quizzes).aggregate(
                avg_score=Avg('quiz_score')
            )['avg_score'] or 0.0

            # Total materials uploaded for this course
            total_materials = Attachment.objects.filter(course=course).count()

            return Response({
                "course_name": course.course_name,
                "total_students": total_students,
                "total_quizzes": total_quizzes,
                "total_quiz_attempts": total_attempts,
                "average_quiz_score": round(average_score, 2),
                "total_materials": total_materials
            })

        except Course.DoesNotExist:
            return Response({"error": "Course not found or access denied."}, status=404)




class QuizzesAndAssessments(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id, teacher__teacher=request.user)
        except Course.DoesNotExist:
            return Response({"error": "Course not found or access denied."}, status=404)

        # Total registered students
        total_students = CourseRegistration.objects.filter(course=course).count()

        # Total quizzes
        quizzes = CourseQuiz.objects.filter(course=course)
        total_quizzes = quizzes.count()

        response_data = {
            "course_name": course.course_name,
            "total_students": total_students,
            "total_quizzes": total_quizzes,
            "quizzes": [],
            "total_materials": Attachment.objects.filter(course=course).count()
        }

        for quiz in quizzes:
            total_attempts = StudentPerformance.objects.filter(quiz=quiz).count()
            expected_attempts = total_students  # 1 attempt per student per quiz
            attempt_percentage = (total_attempts / expected_attempts) * 100 if expected_attempts > 0 else 0.0

            average_score = StudentPerformance.objects.filter(quiz=quiz).aggregate(
                avg_score=Avg('quiz_score')
            )['avg_score'] or 0.0

            response_data["quizzes"].append({
                "quiz_id": quiz.id,
                "quiz_name": quiz.quiz_name,
                "attempt_percentage": round(attempt_percentage, 2),
                "average_score": round(average_score, 2),
                "quiz_date": quiz.quiz_date,
            })

        return Response(response_data, status=200)