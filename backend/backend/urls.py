"""
This module configures URL patterns for the Django project.

It includes routes for:
- The Django admin interface.
- Authentication via the `LoginView`.
- The catalog section, which is handled by including URL patterns from the `piezas` application.

Additionally, it configures the serving of media files in development through Django's static serve 
mechanism.

Imports:
- `admin` for admin site URLs.
- `path` and `include` for URL routing.
- `obtain_auth_token` from Django REST Framework for token authentication (unused in current 
    urlpatterns but available for future use).
- `settings` and `static` for serving media files in development.
- `LoginView` for authentication views.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from django.views.generic import TemplateView
from backend.views import LoginView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", LoginView.as_view()),
    path("api/catalog/", include("piezas.urls")),
]

if settings.FRONTEND_DEV:
    urlpatterns += [re_path(r"^$", lambda request: redirect(settings.FRONTEND_URL, permanent=False))]
else:
    urlpatterns += [
        re_path(r"^manifest.json$", TemplateView.as_view(template_name="manifest.json")),
        re_path(r"^(?!api/|admin/).*", TemplateView.as_view(template_name="index.html")),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
