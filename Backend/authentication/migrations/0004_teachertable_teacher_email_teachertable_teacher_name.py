# Generated by Django 5.1.4 on 2025-04-17 05:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0003_remove_studenttable_student_email_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='teachertable',
            name='teacher_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='teachertable',
            name='teacher_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
