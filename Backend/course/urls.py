from django.urls import path
from . import views  # Import your views if needed

urlpatterns = [
    path('course_registration/', views.CourseRegistrationView.as_view(), name='course-registration'),  # Example URL pattern for course list view
    path('upload-material/', views.UploadMaterialView.as_view(), name='upload-material'),
    path('timestamps/', views.TimeStampListView.as_view(), name='timestamps'),
    path('course/<int:course_id>/materials/', views.CourseMaterialsView.as_view(), name='course-materials'),
    path("student-performance/<int:course_id>", views.StudentPerformanceView.as_view(), name="student-performance"),
    # path('course/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),  # Example URL pattern for course detail view
    path('<int:course_id>/stats/', views.CourseStatsView.as_view(), name='course-status'),
    path('quizzes-assesments/<int:course_id>',views.QuizzesAndAssessments.as_view(), name='quizzes-and-assessments'),
]
