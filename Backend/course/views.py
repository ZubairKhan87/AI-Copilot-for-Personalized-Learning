from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Course,CourseRegistration
from .serializers import CourseRegistrationSerializer
from authentication.models import TeacherTable
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.db.models import Avg, Count, Max
from course.models import MaterialQuizAttempt, MaterialQuizAnswer

import json
import tempfile
import os
from groq import Groq
from django.http import JsonResponse
from django.core.files.storage import default_storage
import PyPDF2
from docx import Document
from rest_framework.decorators import api_view, permission_classes

from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
import mimetypes

from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import hashlib

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
from .models import (
    Course, 
    CourseRegistration, 
    Attachment, 
    TimeStamp, 
    CourseQuiz, 
    StudentPerformance
)
from .serializers import (
    CourseRegistrationSerializer,
    AttachmentSerializer, 
    TimeStampSerializer,
    CourseSerializer
)
from authentication.models import TeacherTable, StudentTable

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
    


class CourseStatsDashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure the user is a teacher
        try:
            teacher = TeacherTable.objects.get(teacher=request.user)
        except TeacherTable.DoesNotExist:
            return Response({'detail': 'Teacher not found.'}, status=404)

        # Retrieve courses taught by the teacher
        courses = teacher.courses.all()
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
            attachments = Attachment.objects.filter(course=course).count()
            course_quizzes = CourseQuiz.objects.filter(course=course)
            print("course_quizzes",course_quizzes)
            # Loop through each registration in the course
            # for registration in registrations:
                # student = registration.student
                # print(student)
                # Now fetch performances only for this course's quizzes
            performances = StudentPerformance.objects.filter(
                # student=student,
                quiz__in=course_quizzes
            )
            print(performances)
            avg_score = performances.aggregate(avg=Avg('quiz_score'))['avg'] or 0.0
            quizzes_taken = performances.count()
            last_active = performances.aggregate(last=Max('quiz__quiz_date'))['last']

            progress = (quizzes_taken / course_quizzes.count()) * 100 if course_quizzes.count() > 0 else 0.0

            response_data.append({
                'course_id': course.id,
                'course_name': course.course_name,
                'progress': round(progress, 2),
                'avgScore': round(avg_score, 2),
                "registrations": registrations.count(),
                "course_quizzes": quizzes_taken,
                "attachments": attachments


            })
        
        print("responsE",response_data)
        return Response(response_data, status=200)


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
            
            # Build response with download URLs
            attachments_data = []
            for attachment in attachments:
                attachments_data.append({
                    'id': attachment.id,
                    'name': attachment.attachment_name,
                    'description': attachment.attachment_description,
                    'file_url': attachment.attachment_file.url if attachment.attachment_file else None,
                    'download_url': attachment.get_download_url(),
                    'file_extension': attachment.get_file_extension(),
                    'file_size': attachment.file_size,
                    'date': attachment.attachment_date,
                    'week': {
                        'id': attachment.weak.id,
                        'name': attachment.weak.week_name
                    }
                })
            
            return Response(attachments_data)
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
    

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CourseRegistration
from .serializers import CourseSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def registered_courses(request):
    # Get all registrations for the current student
    registrations = CourseRegistration.objects.filter(student=request.user.studenttable)
    
    # Get the courses from these registrations
    courses = [registration.course for registration in registrations]
    print("Register courses are: ", courses)
    # Serialize the courses
    serializer = CourseSerializer(courses, many=True)
    
    return Response(serializer.data)


# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status
# from django.shortcuts import get_object_or_404
# from .models import Course, Attachment, CourseQuiz, StudentPerformance, CourseRegistration
# from .serializers import CourseSerializer, AttachmentSerializer, CourseQuizSerializer, StudentPerformanceSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Course, Attachment, CourseQuiz, StudentPerformance, CourseRegistration

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_detail(request, course_id):
    try:
        # Get the course
        course = get_object_or_404(Course, id=course_id)
        
        # Check if student is registered for this course
        # Fix: Use studenttable instead of student_profile
        try:
            student = request.user.studenttable
        except AttributeError:
            return Response(
                {'error': 'Student profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        registration = CourseRegistration.objects.filter(
            course=course, 
            student=student
        ).first()
        
        if not registration:
            return Response(
                {'error': 'You are not registered for this course'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get course attachments grouped by week
        attachments = Attachment.objects.filter(course=course).select_related('weak')
        attachments_by_week = {}
        for attachment in attachments:
            week_name = attachment.weak.week_name
            if week_name not in attachments_by_week:
                attachments_by_week[week_name] = []
            attachments_by_week[week_name].append({
                'id': attachment.id,
                'name': attachment.attachment_name,
                'description': attachment.attachment_description,
                'file': attachment.attachment_file.url if attachment.attachment_file else None,
                'date': attachment.attachment_date
            })
        
        # Get course quizzes
        quizzes = CourseQuiz.objects.filter(course=course)
        quiz_data = []
        for quiz in quizzes:
            # Get student's performance for this quiz
            performance = StudentPerformance.objects.filter(
                student=student, 
                quiz=quiz
            ).first()
            
            quiz_data.append({
                'id': quiz.id,
                'name': quiz.quiz_name,
                'description': quiz.quiz_description,
                'quiz_date': quiz.quiz_date,
                'quiz_end_date': quiz.quiz_end_date,
                'score': performance.quiz_score if performance else None,
                'completed': performance is not None
            })
        
        # Prepare response data
        course_data = {
            'id': course.id,
            'course_name': course.course_name,
            'course_description': course.course_description,
            'course_start_date': course.course_start_date,
            'course_end_date': course.course_end_date,
            'teacher': {
                'id': course.teacher.id,
                'name': course.teacher.teacher_name,
                # Fix: Use teacher.teacher.email to access the User model's email
                'email': course.teacher.teacher.email if hasattr(course.teacher.teacher, 'email') else 'N/A'
            },
            'materials': attachments_by_week,
            'quizzes': quiz_data,
            'registration_date': registration.registration_date,
            'performance': registration.performance
        }
        
        return Response(course_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in course_detail view: {str(e)}")  # Add logging for debugging
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_quiz_from_material(request, material_id):
    """
    Generate quiz questions based on uploaded material content using RAG
    """
    try:
        # Get the material
        try:
            material = Attachment.objects.get(id=material_id)
        except Attachment.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)
        
        # Check if student is enrolled in the course
        try:
            student = request.user.studenttable
            registration = CourseRegistration.objects.filter(
                course=material.course, 
                student=student
            ).first()
            
            if not registration:
                return Response({'error': 'Not enrolled in this course'}, status=403)
        except AttributeError:
            return Response({'error': 'Student profile not found'}, status=404)
        
        # Extract text from the uploaded file
        file_content = extract_text_from_file(material.attachment_file)
        
        if not file_content:
            return Response({'error': 'Could not extract content from file. Please ensure the file is a valid PDF, DOCX, or TXT file.'}, status=400)
        
        print(f"Extracted content length: {len(file_content)} characters")
        print(f"Extracted content preview: {file_content[:200]}...")
        
        # Create embeddings for the material (for RAG system)
        embeddings_created = create_embeddings_for_material(material_id, file_content)
        if not embeddings_created:
            print("Warning: Could not create embeddings for RAG system")
        
        # Get student's performance data for personalization
        student_performance = get_student_performance_data(student, material.course)
        
        # Generate quiz using the full content (chunked appropriately for LLM)
        quiz_data = generate_quiz_with_groq(
            file_content, 
            material, 
            student_performance
        )
        
        if not quiz_data:
            return Response({'error': 'Failed to generate quiz'}, status=500)
        
        return Response(quiz_data, status=200)
        
    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        return Response({'error': str(e)}, status=500)

def extract_text_from_file(file_field):
    """
    Extract text content from uploaded files (PDF, DOCX, TXT)
    """
    try:
        # Create a temporary file to work with
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            # Copy the file content to temporary file
            for chunk in file_field.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name
        
        # Get the original filename to determine extension
        original_filename = file_field.name
        file_extension = os.path.splitext(original_filename)[1].lower()
        
        try:
            if file_extension == '.pdf':
                text = extract_pdf_text(temp_file_path)
            elif file_extension == '.docx':
                text = extract_docx_text(temp_file_path)
            elif file_extension == '.txt':
                text = extract_txt_text(temp_file_path)
            else:
                return None
            
            return text
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        return None


def extract_pdf_text(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        return None


def extract_docx_text(file_path):
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)  # Remove 'docx.' prefix
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting DOCX text: {str(e)}")
        return None


def extract_txt_text(file_path):
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except Exception as e:
        print(f"Error extracting TXT text: {str(e)}")
        return None


def get_student_performance_data(student, course):
    """
    Get student's performance data for quiz personalization
    """
    try:
        # Get student's quiz performances for this course
        course_quizzes = CourseQuiz.objects.filter(course=course)
        performances = StudentPerformance.objects.filter(
            student=student,
            quiz__in=course_quizzes
        )
        
        if performances.exists():
            avg_score = performances.aggregate(avg=Avg('quiz_score'))['avg'] or 0.0
            total_quizzes = performances.count()
            
            # Determine difficulty level based on performance
            if avg_score >= 80:
                difficulty = "advanced"
            elif avg_score >= 60:
                difficulty = "intermediate"
            else:
                difficulty = "basic"
        else:
            avg_score = 0.0
            total_quizzes = 0
            difficulty = "intermediate"  # Default for new students
        
        return {
            'average_score': round(avg_score, 2),
            'total_quizzes_taken': total_quizzes,
            'difficulty_level': difficulty
        }
        
    except Exception as e:
        print(f"Error getting student performance: {str(e)}")
        return {
            'average_score': 0.0,
            'total_quizzes_taken': 0,
            'difficulty_level': 'intermediate'
        }


def generate_quiz_with_groq(content, material, student_performance):
    """
    Generate quiz questions using Groq LLM with proper content chunking
    """
    try:
        # Initialize Groq client
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        # Chunk the content properly for the LLM context window
        content_chunks = chunk_text_for_llm(content, max_chars=2000)
        
        print(f"Content split into {len(content_chunks)} chunks")
        for i, chunk in enumerate(content_chunks[:2]):  # Print first 2 chunks for debugging
            print(f"Chunk {i+1} preview: {chunk[:100]}...")
        
        # Use the most relevant chunks or combine if small enough
        if len(content_chunks) == 1:
            selected_content = content_chunks[0]
        else:
            # Combine chunks up to token limit
            selected_content = combine_chunks_within_limit(content_chunks, max_chars=2500)
        
        print(f"Selected content length: {len(selected_content)} characters")
        
        # Create the prompt
        prompt = create_quiz_prompt(selected_content, material, student_performance)
        
        # Call Groq API
        completion = client.chat.completions.create(
            model="deepseek-r1-distill-llama-70b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.6,
            max_completion_tokens=4096,
            top_p=0.95,
            stream=False,
            stop=None,
        )
        
        # Parse the response
        response_content = completion.choices[0].message.content
        print(f"LLM Response preview: {response_content[:200]}...")
        
        # Parse JSON response from LLM
        try:
            quiz_data = json.loads(response_content)
            return quiz_data
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
            if json_match:
                quiz_data = json.loads(json_match.group())
                return quiz_data
            else:
                print("Failed to parse JSON from LLM response")
                print(f"Full response: {response_content}")
                return None
                
    except Exception as e:
        print(f"Error with Groq API: {str(e)}")
        return None

def combine_chunks_within_limit(chunks, max_chars=2500):
    """
    Combine chunks within character limit
    """
    combined = ""
    for chunk in chunks:
        if len(combined) + len(chunk) + 2 <= max_chars:
            combined += chunk + "\n\n"
        else:
            break
    return combined.strip()

def chunk_text_for_llm(text, max_chars=2000):
    """
    Split text into chunks suitable for LLM processing
    """
    if len(text) <= max_chars:
        return [text]
    
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        if len(current_chunk) + len(paragraph) + 2 <= max_chars:
            current_chunk += paragraph + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = paragraph + "\n\n"
            else:
                # If single paragraph is too long, split by sentences
                sentences = paragraph.split('. ')
                temp_chunk = ""
                for sentence in sentences:
                    if len(temp_chunk) + len(sentence) + 2 <= max_chars:
                        temp_chunk += sentence + ". "
                    else:
                        if temp_chunk:
                            chunks.append(temp_chunk.strip())
                        temp_chunk = sentence + ". "
                if temp_chunk:
                    chunks.append(temp_chunk.strip())
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def create_quiz_prompt(content, material, student_performance):
    """
    Create a detailed prompt for quiz generation
    """
    # Ensure content is not too long for the API
    truncated_content = content[:2500] if len(content) > 2500 else content
    
    prompt = f"""
Based on the following educational material, generate a personalized quiz with subjective questions.

MATERIAL DETAILS:
- Title: {material.attachment_name}
- Description: {material.attachment_description}
- Course: {material.course.course_name}

STUDENT PERFORMANCE DATA:
- Average Score: {student_performance['average_score']}%
- Total Quizzes Taken: {student_performance['total_quizzes_taken']}
- Difficulty Level: {student_performance['difficulty_level']}

MATERIAL CONTENT:
{truncated_content}

REQUIREMENTS:
1. Generate 5-7 subjective questions based on the material content
2. Adjust difficulty based on student's performance level:
   - Basic: Focus on definitions, simple concepts, recall questions
   - Intermediate: Mix of conceptual understanding and application
   - Advanced: Critical thinking, analysis, and synthesis questions
3. Include a mix of question types:
   - Short answer questions (2-3 sentences)
   - Explanation questions (paragraph-length)
   - Application/scenario-based questions
   - Critical thinking questions

4. For each question, provide:
   - The question text
   - Expected answer length (short/medium/long)
   - Key points that should be covered in the answer
   - Point value (out of 10)

Return the response in the following JSON format:
{{
    "quiz_title": "Quiz on {material.attachment_name}",
    "total_points": 50,
    "estimated_time": "30 minutes",
    "questions": [
        {{
            "id": 1,
            "question": "Question text here",
            "type": "short_answer|explanation|application|critical_thinking",
            "expected_length": "short|medium|long",
            "points": 10,
            "key_points": ["Point 1", "Point 2", "Point 3"]
        }}
    ]
}}

Make sure the questions are directly related to the provided material content and are appropriate for the student's performance level.
IMPORTANT: Respond ONLY with valid JSON, no additional text or explanation.
"""
    return prompt



    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_material_quiz(request):
    """
    Submit answers for a material-based quiz and evaluate them using RAG
    """
    try:
        data = request.data
        material_id = data.get('material_id')
        answers = data.get('answers', [])
        quiz_data = data.get('quiz_data', {})
        
        print(f"=== QUIZ SUBMISSION DEBUG ===")
        print(f"Material ID: {material_id}")
        print(f"Number of answers: {len(answers)}")
        print(f"Quiz data keys: {list(quiz_data.keys()) if quiz_data else 'None'}")
        
        # Validation
        if not material_id:
            return Response({'error': 'Material ID is required'}, status=400)
        
        if not answers or len(answers) == 0:
            return Response({'error': 'Answers are required'}, status=400)
        
        # Make quiz_data optional or provide default structure
        if not quiz_data or not isinstance(quiz_data, dict):
            quiz_data = {
                'quiz_title': f'Material Quiz',
                'total_points': len(answers) * 10,
                'questions': [
                    {
                        'id': answer.get('question_id', i + 1),
                        'question': answer.get('question_text', f"Question {i + 1}"),
                        'points': 10,
                        'key_points': ['Understanding', 'Accuracy', 'Completeness']
                    }
                    for i, answer in enumerate(answers)
                ]
            }
        
        # Get material and verify access
        try:
            material = Attachment.objects.get(id=material_id)
            student = request.user.studenttable
            
            registration = CourseRegistration.objects.filter(
                course=material.course, 
                student=student
            ).first()
            
            if not registration:
                return Response({'error': 'Not enrolled in this course'}, status=403)
                
        except (Attachment.DoesNotExist, AttributeError):
            return Response({'error': 'Material not found or access denied'}, status=404)
        
        # Evaluate answers using RAG-enhanced LLM evaluation
        evaluation_results = evaluate_answers_with_rag(answers, quiz_data, material_id)
        
        if not evaluation_results:
            print("LLM evaluation failed, using fallback evaluation")
            evaluation_results = create_intelligent_fallback_evaluation(answers, quiz_data)
        
        # Calculate total score
        total_score = sum(result['awarded_score'] for result in evaluation_results)
        max_possible_score = quiz_data.get('total_points', len(answers) * 10)
        percentage_score = (total_score / max_possible_score) * 100 if max_possible_score > 0 else 0
        
        print(f"=== SCORING RESULTS ===")
        print(f"Total score: {total_score}/{max_possible_score}")
        print(f"Percentage: {percentage_score:.1f}%")
        
        # Create quiz attempt record
        quiz_attempt = MaterialQuizAttempt.objects.create(
            student=student,
            material=material,
            quiz_title=quiz_data.get('quiz_title', f'Quiz on {material.attachment_name}'),
            total_score=total_score,
            max_possible_score=max_possible_score,
            percentage_score=percentage_score
        )
        
        # Save individual answers
        for i, (answer, evaluation) in enumerate(zip(answers, evaluation_results)):
            MaterialQuizAnswer.objects.create(
                quiz_attempt=quiz_attempt,
                question_id=answer.get('question_id', i + 1),
                question_text=answer.get('question_text', f"Question {i + 1}"),
                student_answer=answer.get('answer', ''),
                awarded_score=evaluation['awarded_score'],
                max_score=evaluation['max_score']
            )
        
        # Update student's overall course performance
        update_student_course_performance(student, material.course)
        
        return Response({
            'message': 'Quiz submitted and evaluated successfully',
            'quiz_attempt_id': quiz_attempt.id,
            'total_score': float(total_score),
            'percentage_score': float(percentage_score),
            'max_possible_score': max_possible_score,
            'submitted_at': quiz_attempt.attempt_date,
            'evaluation_details': evaluation_results
        }, status=200)
        
    except Exception as e:
        print(f"Error submitting quiz: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)


def evaluate_answers_with_rag(answers, quiz_data, material_id):
    """
    Evaluate student answers using RAG-enhanced LLM evaluation
    """
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        # Get questions for context
        questions = quiz_data.get('questions', [])
        
        evaluation_results = []
        
        for i, answer in enumerate(answers):
            print(f"\n=== EVALUATING ANSWER {i+1} ===")
            
            # Find corresponding question
            question_data = None
            for q in questions:
                if q.get('id') == answer.get('question_id', i + 1):
                    question_data = q
                    break
            
            if not question_data:
                question_data = {
                    'question': answer.get('question_text', f"Question {i + 1}"),
                    'points': 10,
                    'key_points': ['Understanding', 'Accuracy', 'Completeness']
                }
            
            student_answer = answer.get('answer', '').strip()
            question_text = question_data.get('question', '')
            
            print(f"Question: {question_text[:100]}...")
            print(f"Student answer: {student_answer[:100]}...")
            
            # Use RAG to get relevant context for evaluation
            relevant_chunks = retrieve_relevant_chunks(material_id, question_text + " " + student_answer)
            
            if relevant_chunks:
                print(f"Retrieved {len(relevant_chunks)} relevant chunks:")
                for j, chunk_data in enumerate(relevant_chunks):
                    print(f"  Chunk {j+1} (similarity: {chunk_data['similarity_score']:.3f}): {chunk_data['chunk'][:100]}...")
                
                # Combine relevant chunks for context
                context = "\n".join([chunk_data['chunk'] for chunk_data in relevant_chunks])
            else:
                print("No relevant chunks found, using general evaluation")
                context = "No specific context available from material."
            
            # Create evaluation prompt with RAG context
            evaluation_prompt = create_rag_evaluation_prompt(
                question_data, 
                student_answer, 
                context
            )
            
            print(f"Sending evaluation request to LLM...")
            
            # Call LLM for evaluation
            completion = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[
                    {
                        "role": "user",
                        "content": evaluation_prompt
                    }
                ],
                temperature=0.2,  # Lower temperature for consistent evaluation
                max_completion_tokens=1024,
                top_p=0.95,
                stream=False,
                stop=None,
            )
            
            response_content = completion.choices[0].message.content
            print(f"LLM evaluation response: {response_content[:200]}...")
            
            # Parse evaluation result
            try:
                evaluation_result = json.loads(response_content)
                evaluation_results.append(evaluation_result)
            except json.JSONDecodeError:
                # Try to extract JSON
                import re
                json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
                if json_match:
                    evaluation_result = json.loads(json_match.group())
                    evaluation_results.append(evaluation_result)
                else:
                    print(f"Failed to parse evaluation JSON: {response_content}")
                    # Use fallback for this answer
                    evaluation_results.append(create_single_fallback_evaluation(answer, question_data))
        
        print(f"\n=== EVALUATION COMPLETE ===")
        print(f"Successfully evaluated {len(evaluation_results)} answers")
        
        return evaluation_results
        
    except Exception as e:
        print(f"Error in RAG evaluation: {str(e)}")
        import traceback
        traceback.print_exc()
        return None
def create_rag_evaluation_prompt(question_data, student_answer, context):
    """
    Create evaluation prompt with RAG context
    """
    prompt = f"""
You are an expert educational evaluator. Evaluate the following student answer based on the question, expected key points, and relevant material context.

QUESTION:
{question_data.get('question', 'N/A')}

MAXIMUM POINTS: {question_data.get('points', 10)}

EXPECTED KEY POINTS:
{', '.join(question_data.get('key_points', []))}

RELEVANT MATERIAL CONTEXT:
{context}

STUDENT ANSWER:
{student_answer}

EVALUATION CRITERIA:
1. ACCURACY: Is the answer factually correct based on the material context?
2. COMPLETENESS: Does the answer address all aspects of the question?
3. UNDERSTANDING: Does the student demonstrate comprehension of the concepts?
4. RELEVANCE: Is the answer relevant to the question asked?
5. USE OF CONTEXT: Does the answer align with or contradict the provided material?

SCORING GUIDELINES:
- 9-10 points: Excellent - Accurate, complete, shows deep understanding
- 7-8 points: Good - Mostly accurate and complete, good understanding
- 5-6 points: Satisfactory - Some accuracy, basic understanding shown
- 3-4 points: Needs improvement - Limited accuracy or understanding
- 1-2 points: Poor - Minimal understanding, mostly incorrect
- 0 points: No answer or completely incorrect

Return your evaluation in the following JSON format:
{{
    "awarded_score": 8.5,
    "max_score": {question_data.get('points', 10)},
    "feedback": "Detailed feedback explaining the score",
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "improvements": ["Specific improvement 1", "Specific improvement 2"],
    "accuracy_score": 8,
    "completeness_score": 7,
    "understanding_score": 9,
    "relevance_score": 8
}}

Ensure the awarded_score is between 0 and {question_data.get('points', 10)}.
"""
    return prompt

def create_intelligent_fallback_evaluation(answers, quiz_data):
    """
    Create more intelligent fallback evaluation when LLM fails
    """
    evaluation_results = []
    questions = quiz_data.get('questions', [])
    
    for i, answer in enumerate(answers):
        # Find corresponding question
        question_data = None
        for q in questions:
            if q.get('id') == answer.get('question_id', i + 1):
                question_data = q
                break
        
        if not question_data:
            question_data = {'points': 10, 'key_points': []}
        
        max_score = question_data.get('points', 10)
        student_answer = answer.get('answer', '').strip()
        key_points = question_data.get('key_points', [])
        
        # More sophisticated scoring
        if len(student_answer) == 0:
            awarded_score = 0
            feedback = "No answer provided"
            strengths = []
            improvements = ["Please provide an answer"]
        else:
            # Score based on multiple factors
            length_score = min(len(student_answer) / 100, 1.0)  # Normalize to 0-1
            
            # Check for key points (simple keyword matching)
            key_point_score = 0
            if key_points:
                found_points = 0
                for key_point in key_points:
                    if any(word.lower() in student_answer.lower() for word in key_point.split()):
                        found_points += 1
                key_point_score = found_points / len(key_points)
            else:
                key_point_score = 0.7  # Default if no key points available
            
            # Combine scores
            final_score = (length_score * 0.3 + key_point_score * 0.7) * max_score
            awarded_score = round(max(final_score, max_score * 0.1), 1)  # Minimum 10% for attempting
            
            feedback = f"Answer evaluated automatically. Score based on content relevance and completeness."
            strengths = ["Answer provided"]
            improvements = ["Consider providing more detailed explanations", "Address all key points mentioned in the material"]
        
        evaluation_results.append({
            'awarded_score': awarded_score,
            'max_score': max_score,
            'feedback': feedback,
            'strengths': strengths,
            'improvements': improvements,
            'accuracy_score': awarded_score,
            'completeness_score': awarded_score,
            'understanding_score': awarded_score,
            'relevance_score': awarded_score
        })
    
    return evaluation_results


def create_single_fallback_evaluation(answer, question_data):
    """
    Create fallback evaluation for a single answer
    """
    max_score = question_data.get('points', 10)
    student_answer = answer.get('answer', '').strip()
    
    if len(student_answer) == 0:
        awarded_score = 0
    else:
        # Simple heuristic scoring
        awarded_score = min(max_score * 0.6, max_score)  # Give 60% for attempting
    
    return {
        'awarded_score': awarded_score,
        'max_score': max_score,
        'feedback': 'Answer evaluated using fallback method',
        'strengths': ['Answer provided'] if student_answer else [],
        'improvements': ['Provide more detailed response'],
        'accuracy_score': awarded_score,
        'completeness_score': awarded_score,
        'understanding_score': awarded_score,
        'relevance_score': awarded_score
    }


def create_default_evaluation(answers, quiz_data):
    """
    Create default evaluation when LLM evaluation fails
    """
    evaluation_results = []
    questions = quiz_data.get('questions', [])
    
    for i, answer in enumerate(answers):
        # Find corresponding question or create default
        question_data = None
        for q in questions:
            if q.get('id') == answer.get('question_id', i + 1):
                question_data = q
                break
        
        if not question_data:
            question_data = {'points': 10}
        
        max_score = question_data.get('points', 10)
        
        # Simple scoring based on answer length and content
        student_answer = answer.get('answer', '').strip()
        if len(student_answer) == 0:
            awarded_score = 0
        elif len(student_answer) < 10:
            awarded_score = max_score * 0.3  # 30% for very short answers
        elif len(student_answer) < 50:
            awarded_score = max_score * 0.6  # 60% for short answers
        else:
            awarded_score = max_score * 0.8  # 80% for longer answers
        
        evaluation_results.append({
            'question_id': answer.get('question_id', i + 1),
            'awarded_score': round(awarded_score, 1),
            'max_score': max_score,
            'feedback': 'Answer evaluated automatically',
            'strengths': ['Answer provided'],
            'improvements': ['Consider providing more detailed explanation']
        })
    
    return evaluation_results


def evaluate_answers_with_llm(answers, quiz_data):
    """
    Evaluate student answers using Groq LLM
    """
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        # Create evaluation prompt
        prompt = create_evaluation_prompt(answers, quiz_data)
        
        completion = client.chat.completions.create(
            model="deepseek-r1-distill-llama-70b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Lower temperature for consistent evaluation
            max_completion_tokens=4096,
            top_p=0.95,
            stream=False,
            stop=None,
        )
        
        response_content = completion.choices[0].message.content
        
        # Parse the evaluation results
        try:
            evaluation_results = json.loads(response_content)
            return evaluation_results.get('evaluations', [])
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
            if json_match:
                evaluation_results = json.loads(json_match.group())
                return evaluation_results.get('evaluations', [])
            else:
                print("Failed to parse evaluation JSON")
                return None
                
    except Exception as e:
        print(f"Error with LLM evaluation: {str(e)}")
        return None


def create_evaluation_prompt(answers, quiz_data):
    """
    Create prompt for LLM evaluation
    """
    questions = quiz_data.get('questions', [])
    
    prompt = f"""
You are an expert educational evaluator. Evaluate the following student answers based on the provided questions and key points.

EVALUATION CRITERIA:
- Award scores from 0 to 10 for each answer
- Consider accuracy, completeness, understanding, and relevance
- Use the key points as a guide for what should be included
- Be consistent and fair in your evaluation
- Partial credit should be given for partially correct answers

QUESTIONS AND STUDENT ANSWERS:
"""
    
    for i, answer in enumerate(answers):
        question_data = None
        # Find corresponding question data
        for q in questions:
            if q.get('id') == answer.get('question_id', i + 1):
                question_data = q
                break
        
        if question_data:
            prompt += f"""
Question {i + 1}:
Text: {question_data.get('question', 'N/A')}
Max Points: {question_data.get('points', 10)}
Key Points Expected: {', '.join(question_data.get('key_points', []))}
Student Answer: {answer.get('answer', 'No answer provided')}

"""
    
    prompt += f"""
Return your evaluation in the following JSON format:
{{
    "evaluations": [
        {{
            "question_id": 1,
            "awarded_score": 8.5,
            "max_score": 10,
            "feedback": "Good understanding shown, but missed key point about...",
            "strengths": ["Clear explanation", "Good examples"],
            "improvements": ["Include more specific details", "Address all key points"]
        }}
    ]
}}

Ensure each awarded_score is between 0 and the max_score for that question.
"""
    return prompt


def update_student_course_performance(student, course):
    """
    Update student's overall course performance based on all quiz attempts
    """
    try:
        # Get all material quiz attempts for this student in this course
        course_materials = Attachment.objects.filter(course=course)
        material_attempts = MaterialQuizAttempt.objects.filter(
            student=student,
            material__in=course_materials
        )
        
        # Get regular quiz performances
        course_quizzes = CourseQuiz.objects.filter(course=course)
        regular_performances = StudentPerformance.objects.filter(
            student=student,
            quiz__in=course_quizzes
        )
        
        # Calculate overall performance
        total_scores = []
        
        # Add material quiz scores
        for attempt in material_attempts:
            total_scores.append(float(attempt.percentage_score))
        
        # Add regular quiz scores
        for performance in regular_performances:
            total_scores.append(float(performance.quiz_score))
        
        # Calculate average
        if total_scores:
            average_performance = sum(total_scores) / len(total_scores)
        else:
            average_performance = 0.0
        
        # Update course registration
        registration = CourseRegistration.objects.filter(
            student=student,
            course=course
        ).first()
        
        if registration:
            registration.performance = round(average_performance, 2)
            registration.save()
    
    except Exception as e:
        print(f"Error updating course performance: {str(e)}")

        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_material_quiz_attempts(request, course_id):
    """
    Get student's material quiz attempts for a course
    """
    try:
        student = request.user.studenttable
        course = Course.objects.get(id=course_id)
        
        # Verify student is enrolled
        registration = CourseRegistration.objects.filter(
            student=student,
            course=course
        ).first()
        
        if not registration:
            return Response({'error': 'Not enrolled in this course'}, status=403)
        
        # Get material quiz attempts
        course_materials = Attachment.objects.filter(course=course)
        attempts = MaterialQuizAttempt.objects.filter(
            student=student,
            material__in=course_materials
        ).order_by('-attempt_date')
        
        attempts_data = []
        for attempt in attempts:
            attempts_data.append({
                'id': attempt.id,
                'quiz_title': attempt.quiz_title,
                'material_name': attempt.material.attachment_name,
                'total_score': float(attempt.total_score),
                'percentage_score': float(attempt.percentage_score),
                'max_possible_score': attempt.max_possible_score,
                'attempt_date': attempt.attempt_date,
                'answers_count': attempt.answers.count()
            })
        
        return Response(attempts_data, status=200)
        
    except Exception as e:
        print(f"Error getting quiz attempts: {str(e)}")
        return Response({'error': str(e)}, status=500)
    
# Add this new view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_attachment(request, attachment_id):
    """
    Download attachment with proper filename and content type
    """
    try:
        attachment = get_object_or_404(Attachment, id=attachment_id)
        
        # Check if user has access to this attachment
        # For students: check if they're enrolled in the course
        # For teachers: check if they own the course
        try:
            if hasattr(request.user, 'studenttable'):
                student = request.user.studenttable
                registration = CourseRegistration.objects.filter(
                    course=attachment.course,
                    student=student
                ).first()
                if not registration:
                    return Response({'error': 'Access denied'}, status=403)
            elif hasattr(request.user, 'teachertable'):
                teacher = request.user.teachertable
                if attachment.course.teacher != teacher:
                    return Response({'error': 'Access denied'}, status=403)
            else:
                return Response({'error': 'Access denied'}, status=403)
        except:
            return Response({'error': 'Access denied'}, status=403)
        
        # Check if file exists
        if not attachment.attachment_file:
            raise Http404("File not found")
        
        # Get the file
        file_path = attachment.attachment_file.path
        if not os.path.exists(file_path):
            raise Http404("File not found")
        
        # Get the original filename
        original_filename = os.path.basename(attachment.attachment_file.name)
        
        # Determine content type
        content_type, _ = mimetypes.guess_type(original_filename)
        if content_type is None:
            content_type = 'application/octet-stream'
        
        # Read and serve the file
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{original_filename}"'
            response['Content-Length'] = os.path.getsize(file_path)
            return response
            
    except Exception as e:
        print(f"Error downloading file: {str(e)}")
        raise Http404("File not found")
    




# Improved chunk_text function for better RAG performance
def chunk_text(text, chunk_size=300, overlap=50):
    """
    Split text into overlapping chunks for better RAG performance
    Improved to respect sentence boundaries
    """
    # Split by sentences first
    sentences = text.replace('\n', ' ').split('. ')
    chunks = []
    current_chunk = ""
    current_word_count = 0
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        sentence_words = len(sentence.split())
        
        # If adding this sentence would exceed chunk size, start new chunk
        if current_word_count + sentence_words > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            
            # Start new chunk with overlap
            overlap_words = current_chunk.split()[-overlap:] if overlap > 0 else []
            current_chunk = ' '.join(overlap_words) + ' ' + sentence + '. '
            current_word_count = len(overlap_words) + sentence_words
        else:
            current_chunk += sentence + '. '
            current_word_count += sentence_words
    
    # Add the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks



def create_embeddings_for_material(material_id, file_content):
    """
    Create and store embeddings for material content with improved chunking
    """
    try:
        print(f"Creating embeddings for material {material_id}")
        
        # Create chunks from the content with better strategy
        chunks = chunk_text(file_content, chunk_size=300, overlap=50)
        
        print(f"Created {len(chunks)} chunks from material")
        for i, chunk in enumerate(chunks[:3]):  # Print first 3 chunks
            print(f"Chunk {i+1}: {chunk[:100]}...")
        
        # Generate embeddings for each chunk
        embeddings = embedding_model.encode(chunks)
        
        print(f"Generated embeddings with shape: {embeddings.shape}")
        
        # Create a unique filename for storing embeddings
        embeddings_dir = os.path.join(settings.MEDIA_ROOT, 'embeddings')
        os.makedirs(embeddings_dir, exist_ok=True)
        
        embedding_file = os.path.join(embeddings_dir, f'material_{material_id}_embeddings.pkl')
        
        # Store embeddings and chunks
        embedding_data = {
            'chunks': chunks,
            'embeddings': embeddings,
            'material_id': material_id,
            'created_at': timezone.now().isoformat()
        }
        
        with open(embedding_file, 'wb') as f:
            pickle.dump(embedding_data, f)
        
        print(f"Embeddings saved to {embedding_file}")
        return True
        
    except Exception as e:
        print(f"Error creating embeddings: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def retrieve_relevant_chunks(material_id, query, top_k=3):
    """
    Retrieve the most relevant chunks based on the query using RAG
    """
    try:
        embeddings_dir = os.path.join(settings.MEDIA_ROOT, 'embeddings')
        embedding_file = os.path.join(embeddings_dir, f'material_{material_id}_embeddings.pkl')
        
        print(f"Looking for embeddings file: {embedding_file}")
        
        # Check if embeddings exist
        if not os.path.exists(embedding_file):
            print(f"Embeddings file not found for material {material_id}")
            return None
        
        # Load stored embeddings
        with open(embedding_file, 'rb') as f:
            embedding_data = pickle.load(f)
        
        chunks = embedding_data['chunks']
        chunk_embeddings = embedding_data['embeddings']
        
        print(f"Loaded {len(chunks)} chunks with embeddings shape: {chunk_embeddings.shape}")
        print(f"Query: {query[:100]}...")
        
        # Generate embedding for the query
        query_embedding = embedding_model.encode([query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_embedding, chunk_embeddings)[0]
        
        print(f"Calculated similarities - max: {similarities.max():.3f}, min: {similarities.min():.3f}")
        
        # Get top-k most similar chunks
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        relevant_chunks = []
        for idx in top_indices:
            similarity_score = float(similarities[idx])
            if similarity_score > 0.1:  # Only include chunks with reasonable similarity
                relevant_chunks.append({
                    'chunk': chunks[idx],
                    'similarity_score': similarity_score,
                    'chunk_index': int(idx)
                })
        
        print(f"Returning {len(relevant_chunks)} relevant chunks")
        return relevant_chunks
        
    except Exception as e:
        print(f"Error retrieving chunks: {str(e)}")
        import traceback
        traceback.print_exc()
        return None