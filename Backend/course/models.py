from django.db import models
from authentication.models import TeacherTable,StudentTable
# Create your models here.

class Course(models.Model):
    teacher = models.ForeignKey(TeacherTable, on_delete=models.CASCADE, related_name='courses')
    course_name = models.CharField(max_length=100)
    course_description = models.TextField()
    course_start_date = models.DateField()
    course_end_date = models.DateField()

    def __str__(self):
        return self.course_name
class CourseRegistration(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='registrations')
    student = models.ForeignKey(StudentTable, on_delete=models.CASCADE, related_name='course_registrations')
    performance = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    registration_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.student_name} - {self.course.course_name}"
    
class TimeStamp(models.Model):
    week_name= models.CharField(max_length=50)
    
    def __str__(self):
        return self.week_name
class Attachment(models.Model):
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='attachments')
    weak=models.ForeignKey(TimeStamp, on_delete=models.CASCADE, related_name='attachments')
    attachment_file = models.FileField(upload_to='attachments/')
    attachment_description = models.TextField()
    attachment_name = models.CharField(max_length=100)
    attachment_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.attachment_name

class CourseQuiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    quiz_name = models.CharField(max_length=100)
    quiz_description = models.TextField()
    quiz_date = models.DateField()
    quiz_end_date = models.DateField()

    def __str__(self):
        return f"{self.quiz_name}"
    
class StudentPerformance(models.Model):
    student = models.ForeignKey(StudentTable, on_delete=models.CASCADE, related_name='performances')
    quiz = models.ForeignKey(CourseQuiz, on_delete=models.CASCADE, related_name='quiz')
    quiz_score = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.student.student_name} - {self.quiz.quiz_name} - {self.quiz_score}"