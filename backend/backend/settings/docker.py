from backend.settings.base import *

DEBUG = True

ALLOWED_HOSTS = ["localhost"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:8000"]

INTERNAL_IPS = ["127.0.0.1"]
