from django.db import models
from authentication.models import TeacherTable
# Create your models here.

class Course(models.Model):
    teacher = models.ForeignKey(TeacherTable, on_delete=models.CASCADE, related_name='courses')
    course_name = models.CharField(max_length=100)
    course_description = models.TextField()
    course_start_date = models.DateField()
    course_end_date = models.DateField()

    def __str__(self):
        return self.course_name