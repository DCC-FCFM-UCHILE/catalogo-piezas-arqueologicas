from backend.settings.base import *

DEBUG = False

ALLOWED_HOSTS = [
    "apps.dcc.uchile.cl",
    "test.dcc.uchile.cl",
    "catalogo.test.dcc.uchile.cl",
]

CSRF_TRUSTED_ORIGINS = [
    "https://apps.dcc.uchile.cl",
    "https://test.dcc.uchile.cl",
    "https://catalogo.test.dcc.uchile.cl",
]

ADMINS = [
    ("Área de Desarrollo de Software", "desarrollo@dcc.uchile.cl"),
]
