from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # One-to-One relationship with User model
    is_teacher = models.BooleanField(default=False)  # Custom field to mark if the user is a recruiter
    
    def __str__(self):
        return f"{self.user.username}'s Profile ({'Teacher' if self.is_teacher else 'Student'})"

class StudentTable(models.Model):
    student = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={"userprofile__is_teacher": False},  # Exclude recruiters
    )  # Link only to users who are not recruiters
    def __str__(self):
        return self.student.username


class TeacherTable(models.Model):
    teacher = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher_profile")
    teacher_name = models.CharField(max_length=100, blank=True, null=True)  # Optional field for teacher name
    teacher_email = models.EmailField(blank=True, null=True)  # Optional field for teacher email
    def save(self, *args, **kwargs):
        if not self.teacher.userprofile.is_teacher:  # Check the UserProfile is marked as recruiter

            raise ValueError(f"User {self.teacher.username} is not marked as a teacher.")
        super().save(*args, **kwargs)  # Call the original save method

    def __str__(self):
        return f"Teacher: {self.teacher}"
