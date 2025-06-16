from django.db import models
from authentication.models import TeacherTable, StudentTable

# Create your models here.

class Course(models.Model):
    teacher = models.ForeignKey(TeacherTable, on_delete=models.CASCADE, related_name='courses')
    course_name = models.CharField(max_length=100)
    course_description = models.TextField()
    course_start_date = models.DateField()
    course_end_date = models.DateField()

    def __str__(self):  # Fixed: Added missing underscores
        return self.course_name

class CourseRegistration(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='registrations')
    student = models.ForeignKey(StudentTable, on_delete=models.CASCADE, related_name='course_registrations')
    performance = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    registration_date = models.DateField(auto_now_add=True)

    def __str__(self):  # Fixed: Added missing underscores
        return f"{self.student.student_name} - {self.course.course_name}"

class TimeStamp(models.Model):
    week_name = models.CharField(max_length=50)

    def __str__(self):  # Fixed: Added missing underscores
        return self.week_name

class Attachment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attachments')
    weak = models.ForeignKey(TimeStamp, on_delete=models.CASCADE, related_name='attachments')
    attachment_file = models.FileField(upload_to='attachments/')
    attachment_description = models.TextField()
    attachment_name = models.CharField(max_length=100)
    attachment_date = models.DateField(auto_now_add=True)

    def __str__(self):  # Fixed: Added missing underscores
        return self.attachment_name
    
    # Added helper methods referenced in views
    def get_download_url(self):
        """Return download URL for this attachment"""
        return f"/api/download/{self.id}/"
    
    def get_file_extension(self):
        """Return file extension"""
        if self.attachment_file:
            import os
            return os.path.splitext(self.attachment_file.name)[1].lower()
        return ''
    
    @property
    def file_size(self):
        """Return file size"""
        if self.attachment_file:
            try:
                return self.attachment_file.size
            except:
                return 0
        return 0

class CourseQuiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    quiz_name = models.CharField(max_length=100)
    quiz_description = models.TextField()
    quiz_date = models.DateField()
    quiz_end_date = models.DateField()

    def __str__(self):  # Fixed: Added missing underscores
        return f"{self.quiz_name}"

class StudentPerformance(models.Model):
    student = models.ForeignKey(StudentTable, on_delete=models.CASCADE, related_name='performances')
    quiz = models.ForeignKey(CourseQuiz, on_delete=models.CASCADE, related_name='student_performances')  # Fixed: Changed related_name from 'quiz' to avoid conflicts
    quiz_score = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):  # Fixed: Added missing underscores
        return f"{self.student.student_name} - {self.quiz.quiz_name} - {self.quiz_score}"

class MaterialQuizAttempt(models.Model):
    student = models.ForeignKey(StudentTable, on_delete=models.CASCADE, related_name='material_attempts')
    material = models.ForeignKey(Attachment, on_delete=models.CASCADE, related_name='quiz_attempts')  # Fixed: Changed 'attachment' to 'material' to match views.py usage
    quiz_title = models.CharField(max_length=200, default='Material Quiz')  # Added: Referenced in views but missing
    attempt_date = models.DateTimeField(auto_now_add=True)
    total_score = models.DecimalField(max_digits=5, decimal_places=2)
    max_possible_score = models.IntegerField(default=0)  # Added: Referenced in views but missing
    percentage_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Added: Referenced in views but missing

    def __str__(self):
        return f"{self.student.student_name} - {self.material.attachment_name}"

class MaterialQuizAnswer(models.Model):
    quiz_attempt = models.ForeignKey(MaterialQuizAttempt, on_delete=models.CASCADE, related_name='answers')  # Fixed: Changed 'attempt' to 'quiz_attempt' to match views.py usage
    question_id = models.IntegerField(default=1)  # Added: Referenced in views but missing
    question_text = models.TextField()
    student_answer = models.TextField()
    awarded_score = models.DecimalField(max_digits=5, decimal_places=2)  # Fixed: Changed 'score' to 'awarded_score' to match views.py usage
    max_score = models.IntegerField(default=10)  # Added: Referenced in views but missing

    def __str__(self):
        return f"Answer to '{self.question_text[:30]}...'"