from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserProfile, TeacherTable, StudentTable

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        if not hasattr(instance, "userprofile"):
            UserProfile.objects.create(user=instance)
        instance.userprofile.save()

@receiver(post_save, sender=UserProfile)
def create_or_update_teacher(sender, instance, created, **kwargs):
    if instance.is_teacher:
        # Create teacher record if it doesn't exist
        TeacherTable.objects.get_or_create(teacher=instance.user)
    else:
        # Remove teacher record if exists
        TeacherTable.objects.filter(teacher=instance.user).delete()

@receiver(post_save, sender=UserProfile)
def create_or_update_student(sender, instance, created, **kwargs):
    if not instance.is_teacher:
        # Create student record if it doesn't exist
        StudentTable.objects.get_or_create(student=instance.user)
    else:
        # Remove student record if exists
        StudentTable.objects.filter(student=instance.user).delete()