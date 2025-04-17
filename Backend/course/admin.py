from django.contrib import admin
from .models import Course
from authentication.models import TeacherTable
# Register your models here.
admin.site.register(Course)