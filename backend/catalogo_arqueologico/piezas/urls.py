"""
This module defines URL patterns for the artifact cataloging system's API.

The URL patterns include routes for:
- API documentation, accessible at the 'docs/' path, which uses Django REST Framework's 
built-in documentation feature.
- A catalog view of artifacts, accessible at 'artifacts/', which lists all artifacts 
available in the system.
- Artifact upload and update functionality, accessible at 'artifact/upload' and 
'artifact/<int:pk>/update' respectively, allowing for the creation and modification 
of artifact records.
- Detailed views of individual artifacts, accessible at 'artifact/<int:pk>/', providing 
detailed information about a specific artifact.
- A list view of metadata, accessible at 'metadata/', which lists all metadata records
associated with artifacts.
- An institutions view, accessible at 'institutions/', listing all institutions that 
have artifacts in the catalog.
- A download endpoint for artifacts, accessible at 'artifact/<int:pk>/download', allowing 
for the downloading of artifact data.

Each route is connected to a view from the 'piezas' application, which handles the 
request and response logic for that endpoint.
"""

from django.urls import path, include # unused import include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers # unused import routers
from piezas import views

urlpatterns = [
    path("docs/", include_docs_urls(title="Metadata API")),
    path("artifacts/", views.CatalogAPIView.as_view()),
    path("artifact/upload", views.ArtifactCreateUpdateAPIView.as_view()),
    path("artifact/bulkloading", views.BulkLoadingAPIView.as_view()),
    path("artifact/<int:pk>/", views.ArtifactDetailAPIView.as_view()),
    path("artifact/<int:pk>/update", views.ArtifactCreateUpdateAPIView.as_view()),
    path("metadata/", views.MetadataListAPIView.as_view()),
    path("institutions/", views.InstitutionAPIView.as_view()),
    path("artifact/<int:pk>/download", views.ArtifactDownloadAPIView.as_view()),
]
