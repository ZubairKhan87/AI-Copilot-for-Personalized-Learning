from django.contrib import admin
from .models import Course
from .models import Course, TimeStamp,Attachment, CourseRegistration, CourseQuiz, StudentPerformance
# Register your models here.
admin.site.register(Course)
admin.site.register(CourseRegistration)
admin.site.register(Attachment)
admin.site.register(TimeStamp)
admin.site.register(CourseQuiz)
admin.site.register(StudentPerformance)