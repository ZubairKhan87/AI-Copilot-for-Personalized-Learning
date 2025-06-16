#course/urls.py
from django.urls import path
from . import views  # Import your views if needed
from .views import registered_courses
from .views import student_material_quiz_attempts
from .views import generate_quiz_from_material, submit_material_quiz
from .views import CourseMaterialsView, CourseStatsView, StudentPerformanceView, QuizzesAndAssessments
from .views import CourseRegistrationView, CourseStatsDashboard, UploadMaterialView, TimeStampListView, course_detail


urlpatterns = [
    path('course_registration/', views.CourseRegistrationView.as_view(), name='course-registration'),  # Example URL pattern for course list view
    path('course_details/', views.CourseStatsDashboard.as_view(), name='course-details'),  # Example URL pattern for course list view
    path('upload-material/', views.UploadMaterialView.as_view(), name='upload-material'),
    path('timestamps/', views.TimeStampListView.as_view(), name='timestamps'),
    path('course/<int:course_id>/materials/', views.CourseMaterialsView.as_view(), name='course-materials'),
    path("student-performance/<int:course_id>", views.StudentPerformanceView.as_view(), name="student-performance"),
    # path('course/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),  # Example URL pattern for course detail view
    path('<int:course_id>/stats/', views.CourseStatsView.as_view(), name='course-status'),
    path('quizzes-assesments/<int:course_id>',views.QuizzesAndAssessments.as_view(), name='quizzes-and-assessments'),
    path('registered-courses/', registered_courses, name='registered-courses'),
    path('course-detail/<int:course_id>/', views.course_detail, name='course-detail'),
    path('generate-quiz/<int:material_id>/', views.generate_quiz_from_material, name='generate_quiz'),
    path('submit-material-quiz/', views.submit_material_quiz, name='submit_material_quiz'),
    # Adding this
    path('student-material-quiz-attempts/<int:course_id>/', student_material_quiz_attempts, name='student_material_quiz_attempts'),
    path('download-attachment/<int:attachment_id>/', views.download_attachment, name='download_attachment'),
]
