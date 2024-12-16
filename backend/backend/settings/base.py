from pathlib import Path
import os
import environ

env = environ.Env()

BASE_DIR = Path(__file__).resolve().parent.parent

environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

SECRET_KEY = env.str("DJANGO_SECRET_KEY")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "coreapi",
    "piezas",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

# CFG FRONTEND EN DJANGO
FRONTEND_DEV = env.bool("DJANGO_FRONTEND_DEV", False)
FRONTEND_URL = env.str("DJANGO_FRONTEND_URL", "http://localhost:8080")
FRONTEND_ENV = env.str("DJANGO_FRONTEND_ENV", "dev")

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            f"_frontend/{FRONTEND_ENV}/",
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "piezas.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSIONS_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly"
    ],
}

"""
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
"""
DATABASES = {
        "default": {
        "ENGINE": env.str("DJANGO_DB_ENGINE"),
        "NAME": env.str("DJANGO_DB_NAME"),
        "USER": env.str("DJANGO_DB_USER"),
        "PASSWORD": env.str("DJANGO_DB_PASSWORD"),
        "HOST": env.str("DJANGO_DB_HOST"),
        "PORT": env.int("DJANGO_DB_PORT"),
        }
} 

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = env.str("DJANGO_STATIC_URL")
STATIC_ROOT = "/static"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

#CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS", default=False)
#CORS_ALLOWED_ORIGINS = tuple(env.list("CORS_ALLOWED_ORIGINS", default=[]))
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"https:\/\/(.)*(dcc|ing).uchile.cl",
    r"http:\/\/localhost(.)*",
]
CSRF_TRUSTED_ORIGINS_REGEXES = [
    "http://localhost:8080",  # Agrega el origen del servidor frontend
]
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
}

DATA_ROOT = "../data/"
CULTURE_CSV_PATH = os.path.join(DATA_ROOT, "coleccion-cultura.csv")
MODEL_FOLDER_PATH = os.path.join(DATA_ROOT, "complete-dataset/")
SHAPE_FOLDER_PATH = os.path.join(DATA_ROOT, "clasificacion-forma/")
TAGS_CSV_PATH = os.path.join(DATA_ROOT, "CH_tags.csv")
THUMBNAILS_FOLDER_PATH = os.path.join(DATA_ROOT, "thumbnails/")
DESCRIPTIONS_CSV_PATH = os.path.join(DATA_ROOT, "metadata - descripcion.csv")
MULTIMEDIA_FOLDER_PATH = os.path.join(DATA_ROOT, "multimedia/")
INSTITUTIONS_CSV_PATH = os.path.join(DATA_ROOT, "institutions.csv")

MEDIA_URL = env.str("DJANGO_MEDIA_URL")
MEDIA_ROOT = "/media/"

# Folders for the different types of uploaded files
MATERIALS_URL = "materials/"
OBJECTS_URL = "objects/"
THUMBNAILS_URL = "thumbnails/"
IMAGES_URL = "images/"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
}

EMAIL_BACKEND = env.str("DJANGO_EMAIL_BACKEND")
EMAIL_HOST = env.str("DJANGO_EMAIL_HOST")
EMAIL_PORT = env.int("DJANGO_EMAIL_PORT")
EMAIL_USE_TLS = env.bool("DJANGO_EMAIL_USE_TLS")
EMAIL_HOST_USER = env.str("DJANGO_EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env.str("DJANGO_EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = env.str("DJANGO_SERVER_EMAIL")
SERVER_EMAIL = env.str("DJANGO_SERVER_EMAIL")

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

AUTH_USER_MODEL = "piezas.CustomUser"

# Default login URL
LOGIN_URL = "http://localhost:3000/login"
