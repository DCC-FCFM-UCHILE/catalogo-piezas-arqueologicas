"""
This module defines the models used in the Django application.

Models:
- Institution: Represents an institution with a unique name.
- CustomUser: Extends Django's AbstractUser to include additional fields like role, 
    institution, and a RUT field with custom validation.
- Shape: Represents the shape of an artifact with a unique name.
- Culture: Represents the culture associated with an artifact with a unique name.
- Tag: Represents a tag that can be associated with an artifact with a unique name.
- Thumbnail: Represents a thumbnail image for an artifact with a unique path.
- Model: Represents a 3D model of an artifact with unique attributes for texture, 
    object file, and material file.
- Image: Represents an image associated with an artifact with a unique path.
- Artifact: Represents an artifact with a description and relationships to other models 
    like Thumbnail, Model, Shape, Culture, and Tags.
- TagsIds, CultureIds, ShapeIds: Auxiliary tables to store unique relationships 
    between artifacts and tags, cultures, or shapes when importing.
- ArtifactRequester: Represents a requester of an artifact with details like name, 
    RUT, email, comments, registration status, and relationships to Institution and Artifact.

Each model is designed to capture specific details and relationships necessary for managing 
artifacts within the system.
"""

import logging
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.contrib.auth.models import Group
from .validators import validateRut

logger = logging.getLogger(__name__)


class Institution(models.Model):
    """
    Represents an institution.

    Attributes:
        id (BigAutoField): Primary key.
        name (CharField): Unique name of the institution.
    """

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        """
        String representation of the Institution model.

        Returns the name of the institution.

        Returns:
            str: Name of the institution.
        """
        return self.name


class CustomUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    Adds additional fields and functionality to the default user model,
    including a role field with predefined choices, an institution field,
    and a RUT field with custom validation.

    Attributes:
        role (CharField): User's role within the system, limited to predefined choices.
        institution (CharField): Name of the institution the user is associated with.
        rut (CharField): Unique identifier for the user, validated by a custom validator.
    """

    class RoleUser(models.TextChoices):
        """
        RoleUser class to store the predefined choices for the user's role.
        """

        FUNCIONARIO = "FN", "FUNCIONARIO"
        ADMINISTRADOR = "AD", "ADMIN"

    role = models.CharField(
        max_length=2, choices=RoleUser.choices, default=RoleUser.FUNCIONARIO
    )
    institution = models.ForeignKey(
        Institution, on_delete=models.SET_NULL, blank=True, null=True
    )
    rut = models.CharField(
        max_length=9,
        unique=True,
        help_text="Enter unique identifier without dots or dashes",
        validators=[validateRut],
    )
    email = models.EmailField(unique=True)

    def update_group(self):
        """
        Updates the user's group membership based on their role.

        Clears existing groups and assigns a new group based on the user's role.
        Logs the process.
        """
        self.groups.clear()
        logger.info(f"Updating group for user {self.username} with role {self.role}")
        new_group = None
        if self.role == self.RoleUser.ADMINISTRADOR:
            new_group, _ = Group.objects.get_or_create(name="Administrador")
            self.role = self.RoleUser.ADMINISTRADOR
        elif self.role == self.RoleUser.FUNCIONARIO:
            new_group, _ = Group.objects.get_or_create(name="Funcionario")

        if new_group:
            self.groups.add(new_group)
            logger.info(f"Added user to group: {new_group}")
        logger.info(f"User groups after update: {list(self.groups.all())}")

    def save(self, *args, **kwargs):
        """
        Save method for the CustomUser model.

        Overrides the default save method to ensure new users are marked as
        staff and to update group membership based on role.

        Args:
            args: Variable length argument list.
            kwargs: Arbitrary keyword arguments.
        """
        # New user
        if not self.pk:
            self.is_staff = (
                True  # All users are staff so they can access the admin site
            )
            if self.is_superuser:
                self.role = (
                    self.RoleUser.ADMINISTRADOR
                )  # Change default role for superusers
        super().save(*args, **kwargs)
        self.update_group()


class Shape(models.Model):
    """
    Represents the shape of an artifact.

    Name must be unique.

    Attributes:
        id (BigAutoField): Primary key.
        name (CharField): Unique name of the shape.
    """

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        """
        String representation of the Shape model.

        Returns the name of the shape.

        Returns:
            str: Name of the shape.
        """
        return self.name


class Culture(models.Model):
    """
    Represents the culture associated with an artifact.

    Name must be unique.

    Attributes:
        id (BigAutoField): Primary key.
        name (CharField): Unique name of the culture.
    """

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        """
        String representation of the Culture model.

        Returns the name of the culture.

        Returns:
            str: Name of the culture.
        """
        return self.name


class Tag(models.Model):
    """
    Represents a tag that can be associated with an artifact.

    Name must be unique.

    Attributes:
        id (BigAutoField): Primary key.
        path (ImageField): Path to the thumbnail image, must be unique.
    """

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        """
        String representation of the Tag model.

        Returns the name of the tag.

        Returns:
            str: Name of the tag.
        """
        return self.name


class Thumbnail(models.Model):
    """
    Represents a thumbnail image for an artifact.

    Images must be unique.

    Attributes:
        id (BigAutoField): Primary key.
        path (ImageField): Path to the thumbnail image, must be unique.
    """

    id = models.BigAutoField(primary_key=True)
    path = models.ImageField(upload_to=settings.THUMBNAILS_URL, unique=True)


class Model(models.Model):
    """
    Represents a 3D model of an artifact.

    Each attribute must be unique.

    Attributes:
        id (BigAutoField): Primary key.
        texture (ImageField): Path to the texture image.
        object (FileField): Path to the 3D object file.
        material (FileField): Path to the material file.
    """

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["texture", "object", "material"], name="unique_model_triplet"
            )
        ]

    id = models.BigAutoField(primary_key=True)
    texture = models.ImageField(upload_to=settings.MATERIALS_URL, unique=False)
    object = models.FileField(upload_to=settings.OBJECTS_URL, unique=False)
    material = models.FileField(upload_to=settings.MATERIALS_URL, unique=False)


class Image(models.Model):
    """
    Represents an image associated with an artifact.

    Images must be unique.

    Attributes:
        id (BigAutoField): Primary key.
        id_artifact (ForeignKey): Reference to the associated artifact.
        path (ImageField): Path to the image, must be unique.
    """

    id = models.BigAutoField(primary_key=True)
    id_artifact = models.ForeignKey(
        "Artifact", on_delete=models.CASCADE, null=True, related_name="images"
    )
    path = models.ImageField(upload_to=settings.IMAGES_URL, unique=True)


class Artifact(models.Model):
    """
    Represents an artifact.

    Attributes:
        id (BigAutoField): Primary key.
        description (CharField): Description of the artifact.
        id_thumbnail (ForeignKey): Reference to the associated Thumbnail.
        id_model (ForeignKey): Reference to the associated Model.
        id_shape (ForeignKey): Reference to the associated Shape.
        id_culture (ForeignKey): Reference to the associated Culture.
        id_tags (ManyToManyField): Tags associated with the artifact.
    """

    id = models.BigAutoField(primary_key=True)
    description = models.CharField(max_length=500)
    id_thumbnail = models.ForeignKey(
        Thumbnail, on_delete=models.SET_NULL, null=True, related_name="artifact"
    )
    id_model = models.ForeignKey(
        Model,
        on_delete=models.CASCADE,
        null=True,
        related_name="artifact",
    )
    id_shape = models.ForeignKey(
        Shape, on_delete=models.SET_NULL, null=True, related_name="artifact"
    )
    id_culture = models.ForeignKey(
        Culture, on_delete=models.SET_NULL, null=True, related_name="artifact"
    )
    id_tags = models.ManyToManyField(Tag, blank=True, related_name="artifact")


class TagsIds(models.Model):
    """
    Auxiliary table to store the relationship between the tag and the artifact when importing.

    Tag and ArtifactId must be unique together.

    Attributes:
        id (BigAutoField): Primary key.
        tag (IntegerField): Represents the tag.
        artifactid (IntegerField): Represents the associated artifact.

    Meta:
        constraints (UniqueConstraint): Ensures the combination of tag and artifactid is unique.
    """

    id = models.BigAutoField(primary_key=True)
    tag = models.IntegerField()
    artifactid = models.IntegerField()

    class Meta:
        """
        Meta class for the TagsIds model.

        Attributes:
            constraints (list): List of constraints for the model.
        """

        constraints = [
            models.UniqueConstraint(
                fields=["tag", "artifactid"], name="unique_tag_artifact"
            )
        ]


class CultureIds(models.Model):
    """
    Auxiliary table to store the relationship between the culture and the artifact when importing.

    Culture and ArtifactId must be unique together.

    Attributes:
        id (BigAutoField): Primary key.
        culture (IntegerField): Represents the culture.
        artifactid (IntegerField): Represents the associated artifact.

    Meta:
        constraints (UniqueConstraint): Ensures the combination of culture and artifactid is unique.
    """

    id = models.BigAutoField(primary_key=True)
    culture = models.IntegerField()
    artifactid = models.IntegerField()

    class Meta:
        """
        Meta class for the CultureIds model.

        Attributes:
            constraints (list): List of constraints for the model.
        """

        constraints = [
            models.UniqueConstraint(
                fields=["culture", "artifactid"], name="unique_culture_artifact"
            )
        ]


class ShapeIds(models.Model):
    """
    Auxiliary table to store the relationship between the shape and the artifact when importing.

    Shape and ArtifactId must be unique together.

    Attributes:
        id (BigAutoField): Primary key.
        shape (IntegerField): Represents the shape.
        artifactid (IntegerField): Represents the associated artifact.

    Meta:
        constraints (UniqueConstraint): Ensures the combination of shape and artifactid is unique.
    """

    id = models.BigAutoField(primary_key=True)
    shape = models.IntegerField()
    artifactid = models.IntegerField()

    class Meta:
        """
        Meta class for the ShapeIds model.

        Attributes:
            constraints (list): List of constraints for the model.
        """

        constraints = [
            models.UniqueConstraint(
                fields=["shape", "artifactid"], name="unique_shape_artifact"
            )
        ]


class ArtifactRequester(models.Model):
    """
    Represents a requester of an artifact.

    Attributes:
        id (BigAutoField): Primary key.
        name (CharField): Name of the requester.
        rut (CharField): RUT of the requester.
        email (EmailField): Email of the requester.
        comments (TextField): Optional comments from the requester.
        is_registered (BooleanField): Indicates if the requester is registered.
        institution (ForeignKey): Reference to the associated institution.
        artifact (ForeignKey): Reference to the requested artifact.
    """

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50)
    rut = models.CharField(max_length=9)
    email = models.EmailField()
    comments = models.TextField(max_length=500, null=True)
    is_registered = models.BooleanField(default=True)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.SET_NULL,
        null=True,
        related_name="artifact_requester",
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.SET_NULL,
        null=True,
        related_name="artifact_requester",
    )

    def __str__(self):
        """
        String representation of the ArtifactRequester model.

        Returns the name of the requester.

        Returns:
            str: Name of the requester.
        """
        return self.name
    
class BulkDownloadingRequest(models.Model):
    """
    Represents a request of a many artifacts.
    Attributes:
        id (BigAutoField): Primary key.
        name (CharField): Name of the requester.
        rut (CharField): RUT of the requester.
        email (EmailField): Email of the requester.
        comments (TextField): Optional comments from the requester.
        is_registered (BooleanField): Indicates if the requester is registered.
        institution (ForeignKey): Reference to the associated institution.
        status (CharField): Status of the request (pending, accepted, rejected,partiallyaccepted,downloaded).
        admin_comments(TextField):Optional comments from the person who decline or accept the request.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('partiallyaccepted','Partially accepted'),
        ('downloaded','Downloaded')
    ]
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50)
    rut = models.CharField(max_length=9)
    email = models.EmailField()
    comments = models.TextField(max_length=500, null=True)
    admin_comments = models.TextField(max_length=500,null=True)
    is_registered = models.BooleanField(default=True)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.SET_NULL,
        null=True,
        related_name="institution_requester",
    )
    status = models.CharField(
        max_length=17,
        choices=STATUS_CHOICES,
        default='pending'
    )
    def __str__(self):
        """
        String representation of the BulkDownloadingRequester model.
        Returns the name of the requester.
        Returns:
            str: Name of the requester.
        """
        return self.name
    
    def get_request_count(self):
        """
        Returns the number of artifacts requested in the bulk request.
        Returns:
            int: Number of artifacts requested.
        """
        return self.requests.count()

class Request(models.Model):
    """
    Represents a specific artifact for one bulkdownloadingrequest.

    Attributes:
        artifactRequest (ForeignKey): relaciona el artefacto con la peticion a la que pertenece
        artifact (ForeignKey): Reference to the requested artifact.
        status (CharField): Status of the request (pending, accepted, rejected).
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected')
    ]
    artifact_request = models.ForeignKey(
        BulkDownloadingRequest, 
        on_delete=models.CASCADE,
        related_name="requests"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )
    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.SET_NULL,
        null=True,
        related_name="request")

