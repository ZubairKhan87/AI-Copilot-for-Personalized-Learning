from rest_framework import serializers
from django.contrib.auth.models import User
from authentication.models import TeacherTable
from .models import Course
from .models import Attachment
class CourseRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'course_name', 'course_description', 'course_start_date', 'course_end_date']
        read_only_fields = ['teacher']

    def create(self, validated_data):
        user = self.context['request'].user
        try:
            teacher = TeacherTable.objects.get(teacher=user)
        except TeacherTable.DoesNotExist:
            # Create teacher profile if it doesn't exist
            teacher = TeacherTable.objects.create(
                teacher=user,
                teacher_name=user.username  # Adjust fields as needed
            )
        
        course_registration = Course.objects.create(
            teacher=teacher,
            **validated_data
        )
        return course_registration



from rest_framework import serializers
from .models import Attachment, TimeStamp, Course

# serializers.py
from rest_framework import serializers
from .models import Attachment, TimeStamp, Course

class TimeStampSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeStamp
        fields = ['id', 'week_name']

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'course', 'weak', 'attachment_file', 'attachment_description', 
                  'attachment_name', 'attachment_date']
        read_only_fields = ['attachment_date']