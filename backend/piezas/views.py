"""
This module defines API views for handling operations related to Artifacts, Metadata, 
and Artifact Downloads in the application.

Classes:
- ArtifactDetailAPIView: Provides a detail view for a single artifact. 
- MetadataListAPIView: Provides a list view for metadata related to artifacts. 
- CustomPageNumberPagination: Provides paginated responses for API views.
- CatalogAPIView: Provides a list view for artifacts in the catalog.
- ArtifactCreateUpdateAPIView: Provides functionality for creating and updating artifacts.
- InstitutionAPIView: Provides a list view for institutions.
"""

import math
import zipfile
import pandas as pd
import time
import threading
import numpy as np
from PIL import Image as PILImage
from scipy.spatial import distance
from ast import literal_eval
import json
import re
import shutil
from io import BytesIO
import logging
import os
from rest_framework import permissions, generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.db import transaction
from rest_framework.views import APIView
from django.db.models import Q
from django.core.files import File
from django.http import HttpResponse
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from .serializers import (
    ArtifactSerializer,
    CatalogSerializer,
    UpdateArtifactSerializer,
    InstitutionSerializer,
    ShapeSerializer,
    TagSerializer,
    CultureSerializer,
    BulkDownloadingRequestSerializer,
    BulkDownloadingRequestRequestSerializer,
    DescriptorArtifactSerializer
)
from .models import (
    Artifact,
    CustomUser,
    Institution,
    Image,
    Shape,
    Tag,
    Culture,
    Model,
    Thumbnail,
    BulkDownloadingRequest,
    Request,
)
from .permissions import IsFuncionarioPermission, IsAdminPermission
from .authentication import TokenAuthentication
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
logger = logging.getLogger(__name__)
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model
class ArtifactDetailAPIView(generics.RetrieveAPIView):
    """
    A view that provides detail for a single artifact.

    It extends Django REST Framework's RetrieveAPIView.

    Attributes:
        queryset: Specifies the queryset that this view will use to retrieve
            the Artifact object. It retrieves all Artifact objects.
        serializer_class: Specifies the serializer class that should be used
            for serializing the Artifact object.
        permission_classes: Defines the list of permissions that apply to
            this view. It is set to allow any user to access this view.
    """

    queryset = Artifact.objects.all()
    serializer_class = ArtifactSerializer
    permission_classes = [permissions.AllowAny]


class MetadataListAPIView(generics.ListAPIView):
    """
    A view that provides a list of metadata related to artifacts.

    It extends Django REST Framework's ListAPIView.

    Attributes:
        permission_classes: Defines the list of permissions that apply to this
            view. It is set to allow any user to access this view.
    """

    permission_classes = [permissions.AllowAny]
    def get(self, request, *args, **kwargs):
        """
        Handles GET requests.

        It retrieves all shapes, tags, and cultures from the database, serializes them,
        and returns them in a response.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing serialized
                data for shapes, tags, and cultures.
        """
        try:
            shapes = Shape.objects.all()
            tags = Tag.objects.all()
            cultures = Culture.objects.all()
            
            # Serialize the data
            shape_serializer = ShapeSerializer(shapes, many=True)
            tag_serializer = TagSerializer(tags, many=True)
            culture_serializer = CultureSerializer(cultures, many=True)

            # Function to change 'name' key to 'value'
            def rename_key(lst):
                return [{"id": item["id"], "value": item["name"]} for item in lst]
            # Combine the data with 'name' key changed to 'value'
            data = {
                "shapes": rename_key(shape_serializer.data),
                "tags": rename_key(tag_serializer.data),
                "cultures": rename_key(culture_serializer.data),
            }

            return Response({"data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Could not retrieve metadata:{e}")
            return Response({"detail": f"Error al obtener metadata"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomPageNumberPagination(PageNumberPagination):
    """
    A custom pagination class that provides paginated responses for API views.

    It extends Django REST Framework's PageNumberPagination.

    Attributes:
        page_size: Specifies the number of items to display per page.
    """

    page_size = 9

    def get_paginated_response(self, data):
        """
        Retrieves paginated response data.

        Args:
            data: The data to be paginated.

        Returns:
            Response: Django REST Framework's Response object containing paginated data.
        """
        return Response(
            {
                "current_page": int(self.request.query_params.get("page", 1)),
                "total": self.page.paginator.count,
                "per_page": self.page_size,
                "total_pages": math.ceil(self.page.paginator.count / self.page_size),
                "data": data,
            }
        )


class CatalogAPIView(generics.ListAPIView):
    """
    A view that provides a list of artifacts in the catalog.

    It extends Django REST Framework's ListAPIView.

    Attributes:
        serializer_class: Specifies the serializer class that should be used
            for serializing the Artifact objects.
        pagination_class: Specifies the pagination class that should be used
            for paginating the response data.
        permission_classes: Defines the list of permissions that apply to
            this view. It is set to allow any user to access this view.
    """

    serializer_class = CatalogSerializer
    pagination_class = CustomPageNumberPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        Retrieves the queryset for the view.

        Returns:
            queryset: The queryset containing all artifacts in the catalog.
        """
        queryset = Artifact.objects.all().order_by("id")

        # Filtros a partir de parámetros de consulta (query parameters)
        description = self.request.query_params.get("query", None)
        culture = self.request.query_params.get("culture", None)
        shape = self.request.query_params.get("shape", None)
        tags = self.request.query_params.get("tags", None)

        q_objects = Q()

        # Case insensitive search
        if description is not None:
            q_objects &= Q(description__icontains=description) | Q(id__icontains=description)
        if culture is not None:
            q_objects &= Q(id_culture__name__iexact=culture)
        if shape is not None:
            q_objects &= Q(id_shape__name__iexact=shape)
        if tags is not None:
            for tag in tags.split(","):
                q_objects &= Q(id_tags__name__iexact=tag.strip())

        # Filtramos el queryset con los q_objects
        filtered_queryset = queryset.filter(q_objects)
        return filtered_queryset

    def get_available_filters(self, filtered_queryset):
        """
        Obtiene las culturas, formas y etiquetas disponibles en el queryset filtrado.
        """
        available_cultures = Artifact.objects.filter(id__in=filtered_queryset).values_list('id_culture__name', flat=True).distinct()
        available_shapes = Artifact.objects.filter(id__in=filtered_queryset).values_list('id_shape__name', flat=True).distinct()
        available_tags = Artifact.objects.filter(id__in=filtered_queryset).values_list('id_tags__name', flat=True).distinct()

        available_filters = {
            "cultures": list(available_cultures),
            "shapes": list(available_shapes),
            "tags": list(available_tags),
        }
        return available_filters

    def get_serializer_context(self):
        """
        Retrieves the context for the serializer.

        Returns:
            dict: A dictionary containing the request object.
        """
        return {"request": self.request}

    def get(self, request, *args, **kwargs):
        """
        Handles GET requests.

        It retrieves all artifacts in the catalog, serializes them, and returns
        paginated data in a response.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing paginated
                data for the artifacts.
        """
        # Obtiene el queryset filtrado
        queryset = self.filter_queryset(self.get_queryset())
        
        # Obtiene los filtros únicos (culturas, formas, etiquetas)
        available_filters = self.get_available_filters(queryset)

        # Paginación si es necesario
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            page_data = self.get_paginated_response(serializer.data).data
            return Response({**page_data, "filters": available_filters})


        # Respuesta sin paginación
        serializer = self.get_serializer(queryset, many=True)
        return Response({"data": serializer.data, "filters": available_filters}, status=status.HTTP_200_OK)


class ArtifactCreateUpdateAPIView(generics.GenericAPIView):
    """
    A view that provides functionality for creating and updating artifacts.

    It extends Django REST Framework's GenericAPIView.

    Attributes:
        queryset: Specifies the queryset that this view will use to retrieve
            the Artifact objects. It retrieves all Artifact objects.
        serializer_class: Specifies the serializer class that should be used
            for serializing the Artifact objects.
        lookup_field: Specifies the field that should be used to retrieve a
            single object from the queryset.
        authentication_classes: Defines the list of authentication classes that
            apply to this view. It is set to TokenAuthentication.
        permission_classes: Defines the list of permissions that apply to
            this view. It is set to allow only authenticated users with the
            role of 'Funcionario' or 'Administrador' to access this view.
    """

    queryset = Artifact.objects.all()
    serializer_class = UpdateArtifactSerializer
    lookup_field = "pk"
    authentication_classes = [TokenAuthentication]
    permission_classes = [
        permissions.IsAuthenticated & (IsFuncionarioPermission | IsAdminPermission)
    ]

    def get_object(self):
        """
        Retrieves the object for the view.

        Returns:
            object: The object retrieved from the queryset based on the primary key.
        """
        pk = self.kwargs.get("pk")
        if pk is not None:
            return super().get_object()
        return None

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests.

        It creates a new artifact and returns a response containing the serialized
        data for the created artifact.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing serialized
                data for the created artifact.
        """
        return self.create_or_update(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Handles PUT requests.

        It updates an existing artifact and returns a response containing the serialized
        data for the updated artifact.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing serialized
                data for the updated artifact.
        """
        return self.create_or_update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        """
        Handles PATCH requests.

        It partially updates an existing artifact and returns a response containing the
        serialized data for the updated artifact.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing serialized
                data for the updated artifact.
        """
        return self.create_or_update(request, *args, **kwargs, partial=True)

    def create_or_update(self, request, *args, **kwargs):
        """
        Creates or updates an artifact based on the request data.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing serialized
                data for the created or updated artifact.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        if instance is None:
            logger.info("Creating new artifact")
            serializer = self.get_serializer(data=request.data)
            success_status = status.HTTP_201_CREATED
        else:
            logger.info(f"Updating artifact {instance.id}")
            serializer = self.get_serializer(
                instance, data=request.data, partial=partial
            )
            success_status = status.HTTP_200_OK

        serializer.is_valid(raise_exception=True)

        # Save the instance first
        instance = serializer.save()

        logger.info(f"Handle file uploads for artifact {instance.id}")
        # Handle file uploads
        try:
            self.handle_file_uploads(instance, request.FILES, request.data)
        except Exception as e:
            logger.error(f"Error al subir archivos: {e}")
            return Response(
                {"detail": f"Error al subir archivos"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Save again to ensure all related objects are properly linked
        instance.save()

        return Response(
            {"data": serializer.data},
            status=success_status,
        )

    def perform_create_or_update(self, serializer):
        """
        Performs the creation or update of an artifact based on the serializer.

        Args:
            serializer: The serializer object that contains the data for the artifact.
        """
        serializer.save()

    def handle_file_uploads(self, instance, files, data):
        """
        Handles file uploads for an artifact.

        Args:
            instance: The Artifact object for which the file uploads are being handled.
            files: The files to be uploaded.
            data: The data associated with the files.
        """
        # Handle thumbnail
        thumbnail_data = files.get("new_thumbnail")
        if thumbnail_data:
                # Upload file
                thumbnail_file = File(thumbnail_data, name=thumbnail_data.name)
                # Create Thumbnail instance
                thumbnail = Thumbnail.objects.create(path=thumbnail_file)
                logger.info(f"Thumbnail created: {thumbnail.path}")
                # Set the thumbnail
                instance.id_thumbnail = thumbnail
        else:
            thumbnail_name = data.get("thumbnail", None)
            if thumbnail_name:
                thumbnail_path = os.path.join(settings.THUMBNAILS_URL, thumbnail_name)
                thumbnail = Thumbnail.objects.get(path=thumbnail_path)
                instance.id_thumbnail = thumbnail
                logger.info(f"Thumbnail kept: {thumbnail.path}")
            else:
                instance.id_thumbnail = None
                logger.info("Thumbnail removed")

        # Handle model files
        # New files
        # check if model files are sent in the request
        new_texture_file = files.get("model[new_texture]")
        new_object_file = files.get("model[new_object]")
        new_material_file = files.get("model[new_material]")
        print(new_texture_file, new_object_file, new_material_file)

        new_texture_instance, new_object_instance, new_material_instance = (
            None,
            None,
            None,
        )
        if new_texture_file:
            new_texture_instance = File(new_texture_file, name=new_texture_file.name)
            logger.info(f"New texture file: {new_texture_instance}")
        if new_object_file:
            new_object_instance = File(new_object_file, name=new_object_file.name)
            logger.info(f"New object file: {new_object_instance}")
        if new_material_file:
            new_material_instance = File(new_material_file, name=new_material_file.name)
            logger.info(f"New material file: {new_material_instance}")

        # Update Model instance
        # It allows to create a new model with only the new files
        if not new_texture_instance and not new_object_instance and not new_material_instance:
            model = None
        else:
            model, created = Model.objects.get_or_create(
                texture=(
                    new_texture_instance
                    if new_texture_instance
                    else None if not instance.id_model else instance.id_model.texture
                ),
                object=(
                    new_object_instance 
                    if new_object_instance 
                    else None if not instance.id_model else instance.id_model.object
                ),
                material=(
                    new_material_instance
                    if new_material_instance
                    else None if not instance.id_model else instance.id_model.material
                ),
            )
            if created:
                logger.info(
                    f"Model created: {model.texture}, {model.object}, {model.material}"
                )
            else:
                logger.info(
                    f"Model updated: {model.texture}, {model.object}, {model.material}"
                )
        # Set the model
        instance.id_model = model

        # Handle images
        # Get the images that are already uploaded and should be kept, and the new images to be uploaded
        # Old images are unlinked. This way we can set an empty list of images if we want to remove all images

        # First we get the images linked to the artifact
        old_images = Image.objects.filter(id_artifact=instance)
        # We update them so they are not linked to the artifact anymore
        for image in old_images:
            image.id_artifact = None
            image.save()
            logger.info(f"Image unlinked: {image.path}")

        # Now we recover the images that should be kept
        keep_images = data.getlist(
            "images", []
        )  # images are paths from photos already uploaded
        for image_name in keep_images:
            # Update instances
            image_path = os.path.join(settings.IMAGES_URL, image_name)
            image = Image.objects.get(path=image_path)
            image.id_artifact = instance
            image.save()
            logger.info(f"Image updated: {image.path}")

        new_images = files.getlist(
            "new_images", []
        )  # new_images are files to be uploaded
        for image_data in new_images:
            image_file = File(image_data, name=image_data.name)
            # Create Image instance
            image = Image.objects.create(id_artifact=instance, path=image_file)
            logger.info(f"Image created: {image.path}")


class BulkLoadingAPIView(generics.GenericAPIView):
    """
    A view that provides functionality for bulk loading artifacts.

    It extends Django REST Framework's GenericAPIView.

    Attributes:
        queryset: Specifies the queryset that this view will use to retrieve
            the Artifact objects. It retrieves all Artifact objects.
        serializer_class: Specifies the serializer class that should be used
            for serializing the Artifact objects.
        authentication_classes: Defines the list of authentication classes that
            apply to this view. It is set to TokenAuthentication.
        permission_classes: Defines the list of permissions that apply to
            this view. It is set to allow only authenticated users with the
            role of 'Funcionario' or 'Administrador' to access this view.
    """

    queryset = Artifact.objects.all()
    serializer_class = UpdateArtifactSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [
        permissions.IsAuthenticated & (IsFuncionarioPermission | IsAdminPermission)
    ]
    temp_dir = ""


    def put(self, request, *args, **kwargs):
        """
        Handles PUT requests.

        It bulk loads artifacts and returns a response containing the serialized
        data for the created artifacts.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing serialized
                data for the created artifacts.
        """
        #falta implementar
        matches = request.data.get("posible_matches")
        temp = request.data.get("temp_dir")
        self.temp_dir = settings.MEDIA_ROOT+"temp/"+temp
        for match in matches:
            try:
                print(match)
                new_artifact = match["new_artifact"]
                match_artifact = match["match_artifact"]
                print(new_artifact)
                print(match_artifact)
                status_match = new_artifact["status"]
                if status_match == "replace":
                    print("Reemplazar")
                    #reemplazar la pieza conid match_artifact con la info de new_artifact
                    #buscar la pieza a reemplazar
                    artifact = Artifact.objects.get(id=match_artifact)
                    #buscar etiquetas
                    tags_instances = []
                    for tag in new_artifact["tags"]:
                        tag_instance = Tag.objects.get(name=tag)
                        tags_instances.append(tag_instance)

                    #buscar la cultura
                    culture_instance = Culture.objects.get(name=new_artifact["culture"])

                    #buscar la forma
                    shape_instance = Shape.objects.get(name=new_artifact["shape"])

                    #descripción
                    description = new_artifact["description"]

                    #buscar algun archivo de thumbnail
                    thumbnail = new_artifact["file_thumbnail"]
                    thumbnail_path = os.path.normpath(self.temp_dir + thumbnail)
                    with open(thumbnail_path, "rb") as f:
                        thumbnail_file = File(f, name=thumbnail)
                        thumbnail_instance = Thumbnail.objects.create(path=thumbnail_file)

                    #buscar los archivos de modelo
                    models = new_artifact["files_model"]
                    texture_file = [file for file in models if file.endswith(".jpg")]
                    object_file = [file for file in models if file.endswith(".obj")]
                    material_file = [file for file in models if file.endswith(".mtl")]
                    if texture_file != [] and object_file != [] and material_file != []:
                        texture_path = os.path.normpath(self.temp_dir + texture_file[0])
                        object_path = os.path.normpath(self.temp_dir + object_file[0])
                        material_path = os.path.normpath(self.temp_dir + material_file[0])
                        with open(texture_path, "rb") as f:
                            texture_file = File(f, name=texture_file[0])
                            with open(object_path, "rb") as f:
                                object_file = File(f, name=object_file[0])
                                with open(material_path, "rb") as f:
                                    material_file = File(f, name=material_file[0])
                                    model, created = Model.objects.get_or_create(
                                        texture=texture_file,
                                        object=object_file,
                                        material=material_file,
                                    )
                        if created:
                            logger.info(f"Model created: {model.texture}, {model.object}, {model.material}")
                        else:
                            logger.info(f"Model updated: {model.texture}, {model.object}, {model.material}")
                    else:
                        model = None
                    # crear la pieza
                    artifact.description = description
                    artifact.id_thumbnail = thumbnail_instance
                    artifact.id_model = model
                    artifact.id_shape = shape_instance
                    artifact.id_culture = culture_instance
                    artifact.save()
                    # borramos las etiquetas anteriores
                    artifact.id_tags.clear()
                    for tag_instance in tags_instances:
                        artifact.id_tags.add(tag_instance)

                    # borramos las imagenes anteriores
                    images = Image.objects.filter(id_artifact=artifact)
                    for image in images:
                        image.delete()
                    #imagenes
                    images = new_artifact["files_images"]
                    images_instances = []
                    for image in images:
                        image_path = os.path.normpath(self.temp_dir + image)
                        with open(image_path, "rb") as f:
                            image_file = File(f, name=image)
                            image_instance = Image.objects.create(path=image_file, id_artifact=artifact)
                            images_instances.append(image_instance)
                            
                
                elif status_match == "keep":
                    print("Mantener")
                elif status_match == "new":
                    print("Nuevo")
                    #crear la pieza con la info de new_artifact
                    #buscar etiquetas
                    tags_instances = []
                    for tag in new_artifact["tags"]:
                        tag_instance = Tag.objects.get(name=tag)
                        tags_instances.append(tag_instance)

                    #buscar la cultura
                    culture_instance = Culture.objects.get(name=new_artifact["culture"])

                    #buscar la forma
                    shape_instance = Shape.objects.get(name=new_artifact["shape"])

                    #descripción
                    description = new_artifact["description"]

                    #buscar algun archivo de thumbnail
                    thumbnail = new_artifact["file_thumbnail"]
                    thumbnail_path = os.path.normpath(self.temp_dir + thumbnail)
                    with open(thumbnail_path, "rb") as f:
                        thumbnail_file = File(f, name=thumbnail)
                        thumbnail_instance = Thumbnail.objects.create(path=thumbnail_file)

                    #buscar los archivos de modelo
                    models = new_artifact["files_model"]
                    texture_file = [file for file in models if file.endswith(".jpg")]
                    object_file = [file for file in models if file.endswith(".obj")]
                    material_file = [file for file in models if file.endswith(".mtl")]
                    if texture_file != [] and object_file != [] and material_file != []:
                        texture_path = os.path.normpath(self.temp_dir + texture_file[0])
                        object_path = os.path.normpath(self.temp_dir + object_file[0])
                        material_path = os.path.normpath(self.temp_dir + material_file[0])
                        with open(texture_path, "rb") as f:
                            texture_file = File(f, name=texture_file[0])
                            with open(object_path, "rb") as f:
                                object_file = File(f, name=object_file[0])
                                with open(material_path, "rb") as f:
                                    material_file = File(f, name=material_file[0])
                                    model, created = Model.objects.get_or_create(
                                        texture=texture_file,
                                        object=object_file,
                                        material=material_file,
                                    )
                        if created:
                            logger.info(f"Model created: {model.texture}, {model.object}, {model.material}")
                        else:
                            logger.info(f"Model updated: {model.texture}, {model.object}, {model.material}")
                    else:
                        model = None
                    # crear la pieza
                    artifact = Artifact.objects.create(description=description, id_thumbnail=thumbnail_instance, id_model=model, id_shape=shape_instance, id_culture=culture_instance)
                    for tag_instance in tags_instances:
                        artifact.id_tags.add(tag_instance)
                    #imagenes
                    images = new_artifact["files_images"]
                    images_instances = []
                    for image in images:
                        image_path = os.path.normpath(self.temp_dir + image)
                        with open(image_path, "rb") as f:
                            image_file = File(f, name=image)
                            image_instance = Image.objects.create(path=image_file, id_artifact=artifact)
                            images_instances.append(image_instance)

            except Exception as e:
                self.delete_files(self.temp_dir)
                return Response(
                    {"detail": f"Error al cargar las piezas: {e}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        self.delete_files(self.temp_dir)
        return Response(
            {"detail": "Piezas actualizadas exitosamente"},
            status=status.HTTP_200_OK,
        )

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests.

        It bulk loads artifacts and returns a response containing the serialized
        data for the created artifacts.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing serialized
                data for the created artifacts.
        """
        errores = []
        logger.info("Bulk loading artifacts")
        try:
            zip_file = request.FILES.get("zip")
            excel_file = request.FILES.get("excel")
        except KeyError:
            return Response(
                {"detail": "Se requiere un archivo ZIP y un archivo Excel"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Check if the files are ZIP and Excel files
        if not zipfile.is_zipfile(zip_file):
            return Response(
                {"detail": "El archivo ZIP no es válido"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not excel_file.name.endswith(".xlsx"):
            return Response(
                {"detail": "El archivo Excel no es válido"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Read the Excel file
        try:
            artifacts = self.read_excel(excel_file)
            logger.info(f"Excel file read: {artifacts.head()}")
        except Exception as e:
            logger.error(f"Error al leer el archivo Excel: {e}")
            return Response(
                {"detail": "Error al leer el archivo Excel"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        #validate the excel file
        valid, errors = self.validate_data(artifacts)
        if not valid:
            return Response(
                {"detail": "Error al validar el archivo Excel", "errores": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Unzip the ZIP file and put the files in a temporary folder
        temp_dir = settings.MEDIA_ROOT+"temp/"+str(hash(zip_file.name+str(time.time())))
        self.temp_dir = temp_dir
        try:
            with zipfile.ZipFile(zip_file, "r") as zip_ref:
                zip_ref.extractall(temp_dir)
        except Exception as e:
            logger.error(f"Error al extraer el archivo ZIP: {e}")
            return Response(
                {"detail": "Error al extraer el archivo ZIP"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        #list all files in the temp folder
        files = self.list_files(temp_dir)
        files_not_temp_path = [file.replace(temp_dir, "") for file in files]
        files_not_temp_path = [os.path.normpath(file) for file in files_not_temp_path]
        #validar que los archivos necesarios estén en el zip
        valid, errors, data_with_files = self.validate_files(artifacts, files_not_temp_path)
        if not valid:
            self.delete_files(temp_dir)
            return Response(
                {"detail": "Error al validar los archivos", "errores": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        #obtenemos los descriptores de las piezas existentes para comparar
        descriptores, ids = self.get_existing_descriptors()
        print("Largo del descriptor",len(descriptores[0]))
        posible_matches = []
        count = 0
        # Iterate over the artifacts and create or update them
        for data in data_with_files:
            desc = [data["thumbnail_desc"]]
            desc.extend(data["images_desc"])
            for d in desc:
                print("Largo del descriptor de las piezas nuevas: ",len(d))
            matriz = distance.cdist(descriptores, desc, 'cityblock')
            min_dist = np.min(matriz)
            min_row, min_col = np.unravel_index(np.argmin(matriz), matriz.shape)
            print(f"Minimo: {min_dist}, en la fila {min_row} y columna {min_col}, correspondiente a la pieza {ids[min_row]} con el artefacto {data['id']}")
            if min_dist < 0.1:
                posible_matches.append({"new_artifact": data, "match_artifact": ids[min_row],})
                continue
            try:
                count += 1
                #buscar etiquetas
                tags_instances = []
                for tag in data["tags"]:
                    tag_instance = Tag.objects.get(name=tag)
                    tags_instances.append(tag_instance)
                
                #buscar la cultura
                culture_instance = Culture.objects.get(name=data["culture"])

                #buscar la forma
                shape_instance = Shape.objects.get(name=data["shape"])

                #descripción
                description = data["description"]

                #buscar algun archivo de thumbnail
                print("Busca archivo thumbnail")
                thumbnail = data["file_thumbnail"]
                thumbnail_path = os.path.join(temp_dir,thumbnail.lstrip("/"))
                with open(thumbnail_path, "rb") as f:
                    thumbnail_file = File(f, name=thumbnail.lstrip("/"))
                    thumbnail_instance = Thumbnail.objects.create(path=thumbnail_file)

                #buscar los archivos de modelo
                print("Busca archivos de modelo")
                models = data["files_model"]
                texture_file = [file for file in models if file.endswith(".jpg")]
                object_file = [file for file in models if file.endswith(".obj")]
                material_file = [file for file in models if file.endswith(".mtl")]
                if texture_file != [] and object_file != [] and material_file != []:
                    texture_path = os.path.join(temp_dir,texture_file[0])
                    object_path = os.path.join(temp_dir,object_file[0])
                    material_path = os.path.join(temp_dir,material_file[0])
                    with open(texture_path, "rb") as f:
                        texture_file = File(f, name=texture_file[0])
                        with open(object_path, "rb") as f:
                            object_file = File(f, name=object_file[0])
                            with open(material_path, "rb") as f:
                                material_file = File(f, name=material_file[0])
                                model, created = Model.objects.get_or_create(
                                    texture=texture_file,
                                    object=object_file,
                                    material=material_file,
                                )
                    if created:
                        logger.info(f"Model created: {model.texture}, {model.object}, {model.material}")
                    else:
                        logger.info(f"Model updated: {model.texture}, {model.object}, {model.material}")
                else:
                    model = None

                # crear la pieza
                print("Crear la pieza")
                artifact = Artifact.objects.create(
                    description=description,
                    id_thumbnail=thumbnail_instance,
                    id_model=model,
                    id_shape=shape_instance,
                    id_culture=culture_instance,
                )
                artifact.save()
                #imagenes
                images = data["files_images"]
                images_instances = []
                for image in images:
                    image_path = os.path.join(temp_dir,image)
                    print("image path:", image_path)
                    with open(image_path, "rb") as f:
                        image_file = File(f, name=image)
                        image_instance = Image.objects.create(path=image_file, id_artifact=artifact)
                        images_instances.append(image_instance)

                for tag_instance in tags_instances:
                    artifact.id_tags.add(tag_instance)
            except Exception as e:
                self.delete_files(temp_dir)
                return Response(
                    {"detail": f"Error al cargar las piezas: {e}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Delete the temporary folder and its contents after 1 hour
        delete_thread = threading.Thread(target=self.delete_files_delay, args=(temp_dir, 3600))
        delete_thread.start()

        #devolvemos solo el hash del directorio temporal
        temp = temp_dir.split("/")[-1]
        return Response(
            {"detail": f"Se han cargado exitosamente {count} piezas", "posible_matches": posible_matches, "temp_dir": temp},
            status=status.HTTP_201_CREATED,
        )

    def delete_files_delay(self, temp_dir, delay):
        print("Deleting files in", delay, "seconds")
        time.sleep(delay)
        self.delete_files(temp_dir)
        print("Files deleted")

    def read_excel(self, excel_file) -> pd.DataFrame:
        """
        Reads an Excel file containing artifact data.

        Args:
            excel_file: The Excel file to be read.

        Returns:
            DataFrame: A Pandas DataFrame containing the data from the Excel file
        """
        excel = pd.read_excel(excel_file, engine="openpyxl", header=0)
        return excel

    def validate_data(self, data: pd.DataFrame) -> tuple[bool, list[str]]:
        """
        Validates the data read from the Excel file.

        Args:
            data: The data read from the Excel file.

        Returns:
            bool: A boolean indicating whether the data is valid.
            list[str]: A list of error messages.
        """
        valid = True
        errors = []
        #chequeamos que tenga 5 columnas sin nulls
        if data.shape[1] != 5:
            valid = False
            errors.append("El archivo Excel debe tener 5 columnas: id o nombre, descripción, forma, cultura, etiquetas")
        
        for index, row in data.iterrows():
            # chequeamos que no haya filas con nulls
            if row.isnull().values.any():
                valid = False
                errors.append(f"La fila {index+2} tiene valores nulos")
                continue
            #chequeamos que la columna de cultura tenga solo culturas existentes
            if not Culture.objects.filter(name=row.iloc[3]).exists():
                valid = False
                errors.append(f"La fila {index+2} tiene una cultura inexistente: {row.iloc[3]}")
            #chequeamos que la columna de tags tenga solo tags existentes
            tags = row.iloc[4].split(",")
            for tag in tags:
                if not Tag.objects.filter(name=tag).exists():
                    valid = False
                    errors.append(f"La fila {index+2} tiene una etiqueta inexistente: {tag}")
            #chequeamos que la columna de forma tenga solo formas existentes
            if not Shape.objects.filter(name=row.iloc[2]).exists():
                valid = False
                errors.append(f"La fila {index+2} tiene una forma inexistente: {row.iloc[2]}")
        return valid, errors 

    def list_files(self, path: str) -> list:
        """
        Lists files in a directory and its subdirectories.

        Args:
        path: The path to the directory.

        Returns:
        list: A list of files in the directory and its subdirectories.
        """
        file_list = []
        if os.path.isdir(path):
            for entry in os.listdir(path):
                full_path = os.path.join(path, entry)
                if os.path.isdir(full_path):
                    file_list.extend(self.list_files(full_path))
                elif os.path.isfile(full_path):
                    file_list.append(full_path)
        return file_list

    def validate_files(self, data: pd.DataFrame, files: list) -> tuple[bool, list[str], list]:
        """
        Validates the files in the ZIP file based on the data from the Excel file.

        Args:
            data: The data from the Excel file.
            files: The files in the ZIP file.

        Returns:
            bool: A boolean indicating whether the files are valid.
            list: A list of error messages.
            list: A list of dictionaries containing the data for the artifacts and their files.
        """
        valid = True
        errors = []
        files_filtered = files
        data_with_files = []
        pattern = lambda id: re.compile(rf"(^.*[\/\\]+0*{re.escape(id)}[.\,/_\\-]+.*$)")
        for index, row in data.iterrows():
            id = str(row.iloc[0])
            files_row = [file for file in files_filtered if pattern(id).search(file)]
            if len(files_row) == 0:
                valid = False
                errors.append(f"La pieza {id} no tiene archivos asociados")
                continue
            else:
                thumbnail = [file for file in files_row if "thumbnail" in file]
                if thumbnail == []:
                    valid = False
                    errors.append(f"La pieza {id} no tiene thumbnail")
                elif len(thumbnail) > 1:
                    valid = False
                    errors.append(f"La pieza {id} tiene más de un thumbnail: {thumbnail}")
                model_files = [file for file in files_row if "obj" in file]
                obj = [file for file in model_files if file.endswith(".obj")]
                mtl = [file for file in model_files if file.endswith(".mtl")]
                jpg = [file for file in model_files if file.endswith(".jpg")]
                images = [file for file in files_row if (("jpg" in file) or ("png" in file))
                           and file not in thumbnail and file not in model_files]
                if len(images) == 0 and (len(obj) == 0 or len(mtl) == 0 or len(jpg) == 0):
                    valid = False
                    if len(obj) == 0:
                        errors.append(f"La pieza {id} no tiene archivo .obj")
                    if len(mtl) == 0:
                        errors.append(f"La pieza {id} no tiene archivo .mtl")
                    if len(jpg) == 0:
                        errors.append(f"La pieza {id} no tiene archivo .jpg")
                    if len(images) == 0:
                        errors.append(f"La pieza {id} no tiene imágenes ni modelo")
                if valid:
                    thumbnail_desc = self.get_descriptor(thumbnail[0])
                    images_desc = [self.get_descriptor(image) for image in images]
                    data_with_files.append({"id": row.iloc[0], "description": row.iloc[1],"shape": row.iloc[2], "culture": row.iloc[3], "tags": row.iloc[4].split(","), "file_thumbnail": thumbnail[0], "files_model": model_files, "files_images": images, "thumbnail_desc": thumbnail_desc, "images_desc": images_desc})
                files_filtered = [file for file in files_filtered if file not in files_row]
        return valid, errors, data_with_files

    def delete_files(self, path: str):
        """
        Deletes files in a directory and its subdirectories.

        Args:
            path: The path to the directory.
        """
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
                logger.info(f"Deleted directory: {path}")
            else:
                os.remove(path)
                logger.info(f"Deleted file: {path}")
        except Exception as e:
            logger.error(f"Error al eliminar archivos: {e}")

    def get_existing_descriptors(self):
        """
        Retrieve existing descriptors from the database using DescriptorArtifactSerializer.

        Returns:
            tuple: A tuple containing two lists: one for descriptors and one for IDs.
        """
        artifacts = Artifact.objects.all()  # Obtén todos los artefactos
        serializer = DescriptorArtifactSerializer(artifacts, many=True)  # Serializa los artefactos

        # Aquí accedemos a los datos como una lista de diccionarios devueltos por to_representation
        descriptors = []
        ids = []
        
        for item in serializer.data:
            print(item["ids"])
            descriptors_str = item["descriptors"]
            for descriptor_str in descriptors_str:
                if isinstance(descriptor_str, str):
                    try:
                        descriptors_list = literal_eval(descriptor_str)
                    except (ValueError, SyntaxError):
                        descriptors_list = []
                else:
                    descriptors_list = descriptor_str

                descriptor_array = np.array(descriptors_list)
                descriptors.append(descriptor_array)
            ids.extend(item["ids"])
        return descriptors, ids

    def get_descriptor(self, path: str):
        """
        Get the descriptor of a file.
        """
        try:
            # Load the image in grayscale
            image = PILImage.open(self.temp_dir + path).convert("L")
            img_array = np.array(image)

            # Equalize the histogram manually
            hist, bins = np.histogram(img_array.flatten(), 256, [0, 256])
            cdf = hist.cumsum()
            cdf_normalized = (cdf - cdf.min()) * 255 / (cdf.max() - cdf.min())
            img_eq = cdf_normalized[img_array]

            # Descriptor parameters
            num_zonas_x = 4
            num_zonas_y = 4
            num_bins_por_zona = 8
            descriptor = []

            # Compute histograms for each zone
            zona_height = img_eq.shape[0] // num_zonas_y
            zona_width = img_eq.shape[1] // num_zonas_x

            for j in range(num_zonas_y):
                for i in range(num_zonas_x):
                    # Extract the zone
                    zona = img_eq[
                        j * zona_height:(j + 1) * zona_height,
                        i * zona_width:(i + 1) * zona_width,
                    ]
                    # Calculate histogram for the zone
                    hist_zona, _ = np.histogram(zona, bins=num_bins_por_zona, range=(0, 256))
                    # Normalize the histogram
                    hist_zona = hist_zona / np.sum(hist_zona)
                    # Append to the global descriptor
                    descriptor.extend(hist_zona)
            return descriptor
        except Exception as e:
            # Handle errors (e.g., file not found, invalid image)
            print(f"Error calculating histogram: {e}")
            return []
        

class InstitutionAPIView(generics.ListCreateAPIView):
    """
    A view that provides a list of institutions.

    It extends Django REST Framework's ListCreateAPIView.

    Attributes:
        queryset: Specifies the queryset that this view will use to retrieve
            the Institution objects. It retrieves all Institution objects.
        serializer_class: Specifies the serializer class that should be used
            for serializing the Institution objects.
        permission_classes: Defines the list of permissions that apply to
            this view. It is set to allow any user to access this view.
    """
    queryset = Institution.objects.all().order_by("id")
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        """
        Handles GET requests.

        It retrieves all institutions, serializes them, and returns them in a response.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: Django REST Framework's Response object containing serialized
                data for the institutions.
        """
        try:
            institutions = Institution.objects.all()

            # Serialize the data
            institution_serializer = InstitutionSerializer(institutions, many=True)
            # Function to change 'name' key to 'value'
            def rename_key(lst):
                return [{"id": item["id"], "value": item["name"]} for item in lst]
            data = rename_key(institution_serializer.data)
            return Response({"data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Could not retrieve institutions:{e}")
            return Response({"detail": f"Error al obtener instituciones"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ArtifactBulkDetailAPIView(APIView):
    """
    View to handle bulk download requests, allowing both authenticated and non-authenticated requests.
    """

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests for bulk download requests, creating BulkDownloadingRequest and
        individual Request records for each artifact ID provided.
        """
        # if the user is not autenticated, use the form information, else use the user information and the data is avaible to download 
        # immediately 
        #if not request.user.is_authenticated:
        is_authenticated = request.data["authenticated"]
        print(request.data["authenticated"])
        #print(is_authenticated)
        #if not request.user.is_authenticated:
        if not is_authenticated:
            print("usuario no autenticado")
            # extract the data from the form
            name = request.data.get("fullName")
            rut = request.data.get("rut")
            email = request.data.get("email")
            institution_id = request.data.get("institution")
            comments = request.data.get("comments")
            artifact_ids = request.data.get("artifacts", [])

            # verificated if all the information is here.
            if not all([name, rut, email, institution_id, artifact_ids]):
                return Response(
                    {"detail": "Faltan datos requeridos en la solicitud."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # get the institution
                institution = get_object_or_404(Institution, id=institution_id)

                # create the row in BulkDownloadingRequest
                bulk_request = BulkDownloadingRequest.objects.create(
                    name=name,
                    rut=rut,
                    email=email,
                    comments=comments,
                    is_registered=False,
                    institution=institution,
                    status="pending",
                    admin_comments=None  
                )
                print("BulkDownloadingRequest creado:", bulk_request)
                # create a request for each artifact that the person wants
                for artifact_id in artifact_ids:
                    artifact = get_object_or_404(Artifact, id=artifact_id)
                    print(f"Artifact encontrado: {artifact}")
                    Request.objects.create(
                        artifact_request=bulk_request,
                        artifact=artifact,
                        status="pending"
                    )
                
                # Log para confirmación de creación exitosa
                logger.info("Bulk download request created successfully for non-authenticated user.")

                # success response
                return Response(
                    {"detail": "Solicitud de descarga registrada exitosamente."},
                    status=status.HTTP_201_CREATED
                )

            except Exception as e:
                logger.error(f"Error al procesar la solicitud de descarga en masa: {e}")
                return Response(
                    {"detail": "Ocurrió un error al procesar la solicitud."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        else:
            print("usuario autenticado")
            token = request.headers.get("Authorization")
            try:
                token_instance = Token.objects.get(key=token.split(" ")[1])
            except Token.DoesNotExist:
                return Response(
                    {"detail": "Se requiere iniciar sesión nuevamente"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            username = token_instance.user
            print(username)
            try:
                user = CustomUser.objects.get(username=username)
            except CustomUser.DoesNotExist:
                return Response(
                    {"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND
                )
            name = user.first_name + " " + user.last_name
            try:
                bulk_request = BulkDownloadingRequest.objects.create(
                        name=name,
                        rut=user.rut,
                        email=user.email,
                        is_registered=True,
                        institution=user.institution if user.institution else None, 
                        comments=None,
                        status="accepted",
                        admin_comments=None 
                    )
                print("BulkDownloadingRequest usuario autenticado creado:", bulk_request)
                artifact_ids = request.data.get("artifacts", [])
                for artifact_id in artifact_ids:
                    artifact = get_object_or_404(Artifact, id=artifact_id)
                    print(f"Artifact encontrado: {artifact}")
                    Request.objects.create(
                        artifact_request=bulk_request,
                        artifact=artifact,
                        status="accepted"
                    )

                # success response
                return Response(
                    {"detail": "Solicitud de descarga registrada exitosamente.",
                     "bulk_request_id":bulk_request.id},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Error al procesar la solicitud de descarga en masa: {e}")
                return Response(
                    {"detail": "Ocurrió un error al procesar la solicitud."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )



    def get(self, request, *args, **kwargs):
        """
        Handles GET requests for downloading multiple artifacts in a ZIP file.
        This method will fetch all the artifacts linked to the BulkDownloadingRequest
        associated with the authenticated user or by the request id if available.
        """
        reqnumber = kwargs.get("reqnumber")
        print(reqnumber)
        # Verify that the bulk_request_id is provided
        if not reqnumber:
            return Response(
                {"detail": "Se requiere un ID de solicitud de descarga."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the bulk download request and its associated artifacts
        try:
            #bulk_request = BulkDownloadingRequest.objects.get(id=reqnumber)
            requests = Request.objects.filter(artifact_request_id=reqnumber)
            print(requests)
            artifacts = [req.artifact for req in requests]
            print(artifacts)
        except BulkDownloadingRequest.DoesNotExist:
            return Response(
                {"detail": "Solicitud de descarga no encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create a ZIP file with the artifacts' files
        buffer = BytesIO()
        with zipfile.ZipFile(buffer, "w") as zipf:
            for artifact in artifacts:
                try:
                    if artifact.id_thumbnail:
                        zipf.write(
                            artifact.id_thumbnail.path.path,
                            f"thumbnail/{artifact.id_thumbnail.path}"
                        )
                    if artifact.id_model:
                        zipf.write(
                            artifact.id_model.texture.path,
                            f"model/{artifact.id_model.texture.name}"
                        )
                        zipf.write(
                            artifact.id_model.object.path,
                            f"model/{artifact.id_model.object.name}"
                        )
                        zipf.write(
                            artifact.id_model.material.path,
                            f"model/{artifact.id_model.material.name}"
                        )
                    images = Image.objects.filter(id_artifact=artifact.id)
                    for image in images:
                        zipf.write(image.path.path, f"model/{image.path}")
                except Exception as e:
                    logger.error(f"Error al agregar el archivo de {artifact}: {e}")

        buffer.seek(0)
        # Send the ZIP file in the response
        response = HttpResponse(buffer, content_type="application/zip")
        response["Content-Disposition"] = f"attachment; filename=bulk_artifacts_{reqnumber}.zip"
        return response

        
class RequestsAPIView(generics.ListCreateAPIView):
    """
    A view that provides a list of artifact requests.

    It extends Django REST Framework's ListCreateAPIView.

    Attributes:
        queryset: Specifies the queryset that this view will use to retrieve
            the ArtifactRequester objects. It retrieves all ArtifactRequester objects.
        serializer_class: Specifies the serializer class that should be used
            for serializing the ArtifactRequester objects.
        pagination_class: Specifies the pagination class that should be used
        permission_classes: Defines the list of permissions that apply to
            this view. It is set to allow only authenticated users with the
            role of 'Funcionario' or 'Administrador' to access this view.
    """

    queryset = BulkDownloadingRequest.objects.all().order_by("-id")
    serializer_class = BulkDownloadingRequestSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [
        permissions.IsAuthenticated & IsAdminPermission
    ]

    def get(self, request, *args, **kwargs):
        try:
            requests = self.get_queryset()
            request_serializer = BulkDownloadingRequestSerializer(requests, many=True)
            return Response({"data": request_serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Could not retrieve requests:{e}")
            return Response({"detail": f"Error al obtener solicitudes"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class RequestDetailAPIView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating the status of requests associated
    with a specific BulkDownloadingRequest.
    """
    serializer_class = BulkDownloadingRequestRequestSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [
        permissions.IsAuthenticated & IsAdminPermission
    ]

    def get_queryset(self):
        return BulkDownloadingRequest.objects.all()

    def get(self, request, pk):
        try:
            requested = self.get_queryset().get(pk=pk)
            serializer = BulkDownloadingRequestRequestSerializer(requested)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except BulkDownloadingRequest.DoesNotExist:
            return Response({"detail": "Solicitud no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request, pk):
        try:
            requests = request.data["requests"]
            message = request.data["message"]
            status_request = "pending"
            with transaction.atomic():
                for r in requests:
                    request_artifact = Request.objects.get(pk=r["id"])
                    request_artifact.status = r["status"]
                    request_artifact.save()
                    if status_request == "pending" and r["status"] == "accepted":
                        status_request = "accepted"
                    elif status_request == "pending" and r["status"] == "rejected":
                        status_request = "rejected"
                    elif (status_request == "accepted" and r["status"] == "accepted") or (status_request == "rejected" and r["status"] == "rejected"): 
                        pass
                    else:
                        status_request = "partiallyaccepted"
                bulk_download_request = BulkDownloadingRequest.objects.get(pk=pk)
                bulk_download_request.status = status_request
                bulk_download_request.admin_comments = message
                bulk_download_request.save()
                try:
                    if status_request == "rejected":
                        send_mail(
                            "Solicitud de descarga masiva",
                            f"Su solicitud de descarga masiva ha sido rechazada.\n"
                            f"Comentarios: {message}",
                            'no-reply@tudominio.com',
                            [bulk_download_request.email],
                        )
                    else:
                        send_mail(
                            "Solicitud de descarga masiva",
                            f"Su solicitud de descarga masiva ha sido {status_request}.\n"
                            f"Comentarios: {message} \n"
                            f"Link de descarga: {'http://localhost:8000/api/catalog/artifact/'+str(pk)+'/request/download' if settings.DEBUG else 'https://catalogo.dcc.uchile.cl/api/catalog/artifact/'+str(pk)+'/request/download'} \n"
                            f"este link estará disponible para descargar solo una vez",
                            'no-reply@tudominio.com',
                            [bulk_download_request.email],
                        )
                except Exception as e:
                    logger.error(f"Error al enviar correo: {e}")
                    return Response({"detail": "Error al enviar correo"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


            return Response({"data": "ok"}, status=status.HTTP_200_OK)
        except BulkDownloadingRequest.DoesNotExist:
            return Response({"detail": "Solicitud no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:

            logger.error(f"Error al actualizar solicitud: {e}")
            return Response({"detail": "Error al actualizar solicitud"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RequestDownloadAPIView(generics.GenericAPIView):
    """
    API view for downloading the artifacts associated with a specific BulkDownloadingRequest.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            bulk_download_request = BulkDownloadingRequest.objects.get(pk=pk)
            if bulk_download_request.status == "pending":
                return Response({"detail": "Solicitud pendiente"}, status=status.HTTP_400_BAD_REQUEST)
            elif bulk_download_request.status == "rejected":
                return Response({"detail": "Solicitud rechazada"}, status=status.HTTP_400_BAD_REQUEST)
            elif bulk_download_request.status == "downloaded":
                return Response({"detail": "Solicitud ya descargada"}, status=status.HTTP_400_BAD_REQUEST)
            requests = Request.objects.filter(artifact_request_id=pk, status="accepted")
            artifacts = [r.artifact for r in requests]
            buffer = BytesIO()
            print(artifacts)
            with zipfile.ZipFile(buffer, "w") as zipf:
                for artifact in artifacts:
                    if artifact.id_thumbnail:
                        zipf.write(
                            artifact.id_thumbnail.path.path,
                            f"thumbnail/{artifact.id_thumbnail.path}",
                        )
                    if artifact.id_model:
                        zipf.write(
                            artifact.id_model.texture.path,
                            f"model/{artifact.id_model.texture.name}",
                        )
                        zipf.write(
                            artifact.id_model.object.path,
                            f"model/{artifact.id_model.object.name}",
                        )
                        zipf.write(
                            artifact.id_model.material.path,
                            f"model/{artifact.id_model.material.name}",
                        )
                    images = Image.objects.filter(id_artifact=artifact.id)
                    for image in images:
                        zipf.write(image.path.path, f"model/{image.path}")
            bulk_download_request.status = "downloaded"
            bulk_download_request.save()
        except Exception as e:
            logger.error(f"Error al descargar solicitud: {e}")
            return Response({"detail": "Error al descargar solicitud"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        buffer.seek(0)

        response = HttpResponse(buffer, content_type="application/zip")
        response["Content-Disposition"] = f"attachment; filename=request_{pk}.zip"
        return response

class RequestsNotificationAPIView(generics.GenericAPIView):
    """
    API view for sending the number of pending BulkDownloadingRequest to the frontend 
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [
        permissions.IsAuthenticated & IsAdminPermission
    ]

    def get(self, request):
        """
        Handles GET requests.
        """
        try:
            requests = BulkDownloadingRequest.objects.filter(status="pending")
            return Response({"data": len(requests)}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error al obtener solicitudes pendientes: {e}")
            return Response({"detail": "Error al obtener solicitudes pendientes"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AdminEmailView(APIView):
    def get(self, request):
        admin_user = CustomUser.objects.filter(role=CustomUser.RoleUser.ADMINISTRADOR).first()
        admin_email = admin_user.email if admin_user else None
        return Response({"admin_email": admin_email}, status=status.HTTP_200_OK)
    
 
class PasswordResetRequestView(APIView):
    """
    Api Password Reset , this is the first step to recover the password. The post recives the email and validate
    """
    def post(self, request):
        """
        This post handle the email, if the email is correct the function send a email with the link to recover
        thr password
        """
        try:
            email = request.data.get('email')
            if not email:
                return Response({"error": "Por favor, ingrese un correo electrónico."}, status=400)
            form = PasswordResetForm(data={'email': email})
            if form.is_valid():
                user = form.get_users(email)
                user = next(user, None)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                send_mail(
                    "Password reset request",
                    f"Click the link to reset your password: http://localhost:3000/reset-password/{uid}/{token}",
                    'no-reply@tudominio.com',
                    [email],
                )
                return Response({"message": "Si el correo electrónico proporcionado es válido, revisa tu bandeja de entrada para obtener instrucciones sobre cómo restablecer tu contraseña."}, status=200)
            return Response({"error": "Si el correo electrónico proporcionado es válido, revisa tu bandeja de entrada para obtener instrucciones sobre cómo restablecer tu contraseña."}, status=400)
        except Exception as e:
            return Response({"error": f"Ha ocurrido un error inesperado: {str(e)}"}, status=500)


User = get_user_model()  # get the model for register Users.

class PasswordResetConfirmView(APIView):
    """
    This is the second step to recover password, if everything is ok then 
    the password is finally change. 
    """
    def post(self, request):
        """
        The function take uidb64, token and the new password, the first 2 variables are for verification 
        the link. 
        """
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)  
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been reset."}, status=200)
        return Response({"error": "Invalid token or user ID."}, status=400)