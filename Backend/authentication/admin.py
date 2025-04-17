from django.contrib import admin
from .models import UserProfile,StudentTable,TeacherTable
# # Register your models here.
admin.site.register(UserProfile)
admin.site.register(TeacherTable)
admin.site.register(StudentTable)