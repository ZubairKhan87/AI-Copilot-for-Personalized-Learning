
from django.apps import AppConfig

class authenticationAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'  # replace with your actual app name

    def ready(self):
        import authentication.signals 


