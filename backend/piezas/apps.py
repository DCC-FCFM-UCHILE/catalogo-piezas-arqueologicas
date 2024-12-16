"""
This module defines the Django application configuration for the 'piezas' app.

The PiezasConfig class inherits from AppConfig, providing metadata and 
configuration options for the 'piezas' application.
"""

from django.apps import AppConfig


class PiezasConfig(AppConfig):
    """
    Defines the Django application configuration for the 'piezas' app.

    This class configures the 'piezas' application within a Django project.
    It specifies settings that affect the app's behavior within the project.

    Attributes:
        default_auto_field (str): Specifies the type of auto-created primary keys.
        name (str): The name of the application. It is used by Django to identify
            the application. Here, it is set to 'piezas', which should match the
            name of the Python package for the app.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "piezas"
