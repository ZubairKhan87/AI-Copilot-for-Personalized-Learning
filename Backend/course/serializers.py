#serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from authentication.models import TeacherTable
from .models import Course,CourseRegistration,CourseQuiz,Attachment
from .models import Attachment

# At the top of serializers.py
from .models import CourseQuiz

class CourseQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseQuiz
        fields = '__all__'


class CourseRegistrationSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    no_of_quizzes = serializers.SerializerMethodField()
    uploaded_materials = serializers.SerializerMethodField()
    class Meta:
        model = Course
        fields = ['id', 'course_name', 'course_description', 'course_start_date', 'course_end_date',"student_count","uploaded_materials","no_of_quizzes"]
        read_only_fields = ['teacher']

    def get_student_count(self, obj):
        return CourseRegistration.objects.filter(course=obj).count()
    
    
    def get_no_of_quizzes(self, obj):
        return CourseQuiz.objects.filter(course=obj).count()
    
    def get_uploaded_materials(self, obj):
        return Attachment.objects.filter(course=obj).count()
    

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



from rest_framework import serializers

class StudentPerformanceSerializer(serializers.Serializer):
    name = serializers.CharField()
    progress = serializers.FloatField()
    avgScore = serializers.FloatField()
    quizzesTaken = serializers.IntegerField()
    lastActive = serializers.DateField(allow_null=True)


# from rest_framework import serializers
from .models import Course
from authentication.models import TeacherTable

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherTable
        fields = ['id', 'teacher_name']

class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'course_name', 'course_description', 'course_start_date', 'course_end_date', 'teacher']