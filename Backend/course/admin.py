from django.contrib import admin
from .models import Course
from .models import Course, TimeStamp,Attachment
# Register your models here.
admin.site.register(Course)
admin.site.register(Attachment)
admin.site.register(TimeStamp)