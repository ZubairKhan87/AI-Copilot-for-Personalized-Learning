# Generated by Django 5.1.7 on 2025-06-11 20:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0005_studenttable_student_department_and_more'),
        ('course', '0006_coursequiz_course_alter_studentperformance_quiz'),
    ]

    operations = [
        migrations.CreateModel(
            name='MaterialQuizAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quiz_title', models.CharField(max_length=200)),
                ('total_score', models.DecimalField(decimal_places=2, max_digits=5)),
                ('max_possible_score', models.IntegerField()),
                ('percentage_score', models.DecimalField(decimal_places=2, max_digits=5)),
                ('attempt_date', models.DateTimeField(auto_now_add=True)),
                ('material', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quiz_attempts', to='course.attachment')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='material_quiz_attempts', to='authentication.studenttable')),
            ],
        ),
        migrations.CreateModel(
            name='MaterialQuizAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_id', models.IntegerField()),
                ('question_text', models.TextField()),
                ('student_answer', models.TextField()),
                ('awarded_score', models.DecimalField(decimal_places=2, max_digits=4)),
                ('max_score', models.IntegerField()),
                ('quiz_attempt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='course.materialquizattempt')),
            ],
        ),
    ]
