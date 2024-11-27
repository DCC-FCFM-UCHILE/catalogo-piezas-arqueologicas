"""
This module defines the admin interface customization for the Django application.

It includes custom admin classes for the CustomUser model and other models such 
as Tag, Shape, Culture, and Artifact.

Classes:
    CustomUserAdmin: Customizes the admin interface for the CustomUser model.
    TagAdmin: Customizes the admin interface for the Tag model.
    ShapeAdmin: Customizes the admin interface for the Shape model.
    CultureAdmin: Customizes the admin interface for the Culture model.
    ArtifactAdmin: Customizes the admin interface for the Artifact model.

The module also registers these models with the Django admin to make them available in 
the Django admin panel.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Tag,
    Shape,
    Culture,
    Artifact,
    Model,
    Thumbnail,
    Image,
    Institution,
    CustomUser,
    BulkDownloadingRequest,
    Request,
)
from .forms import CustomUserCreationForm, CustomUserChangeForm


class CustomUserAdmin(UserAdmin):
    """
    Custom user model admin that represents the CustomUser model in the Django admin interface.

    Attributes:
        add_form (forms.ModelForm): The form used for creating new users.
        form (forms.ModelForm): The form used for changing user information.
        model (models.Model): The CustomUser model.
        list_display (list): A list of field names to display in the user list page.
        list_filter (tuple): A tuple of field names to filter by in the user list page.
        fieldsets (tuple): A tuple specifying the layout of the admin “change” page.
        add_fieldsets (tuple): A tuple specifying the layout of the admin “add” page.
    """

    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = [
        "username",
        "email",
        "role",
        "institution",
        "rut",
        "is_staff",
        "is_active",
        "is_superuser",
        "get_groups",
    ]
    list_filter = UserAdmin.list_filter + ("role",)
    fieldsets = UserAdmin.fieldsets + (
        (None, {"fields": ("role", "rut", "institution")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {"fields": ("first_name", "last_name", "email", "role", "rut", "institution")}),
    )

    def get_groups(self, obj):
        """
        Returns a comma-separated string of the user's groups.

        Args:
            obj (CustomUser): The user instance.

        Returns:
            str: A comma-separated string of group names.
        """

        return ", ".join([group.name for group in obj.groups.all()])

    get_groups.short_description = "Groups"

    def save_model(self, request, obj, form, change):
        """
        Saves the model instance and updates the user's group memberships.

        Args:
            request (HttpRequest): The HTTP request instance.
            obj (CustomUser): The user instance being saved.
            form (ModelForm): The form instance.
            change (bool): True if this is a change operation,
                False if this is a creation operation.
        """

        super().save_model(request, obj, form, change)
        obj.update_group()

    def response_change(self, request, obj):
        """
        Handles the response after a change has been made to a user instance.

        Args:
            request (HttpRequest): The HTTP request instance.
            obj (CustomUser): The user instance that was changed.

        Returns:
            HttpResponse: The HTTP response to send back to the client.
        """

        response = super().response_change(request, obj)
        obj.update_group()
        return response


class TagAdmin(admin.ModelAdmin):
    """
    Admin interface options for Tag model.

    Attributes:
        list_display (tuple): Fields to display in the admin list view.
        list_filter (tuple): Fields to filter by in the admin list view.
        search_fields (tuple): Fields to search in the admin list view.
    """

    list_display = ("id", "name")
    list_filter = ("name",)
    search_fields = ("name",)


class ShapeAdmin(admin.ModelAdmin):
    """
    Admin interface options for Shape model.

    Attributes:
        list_display (tuple): Fields to display in the admin list view.
        list_filter (tuple): Fields to filter by in the admin list view.
        search_fields (tuple): Fields to search in the admin list view.
    """

    list_display = ("id", "name")
    list_filter = ("name",)
    search_fields = ("name",)


class CultureAdmin(admin.ModelAdmin):
    """
    Admin interface options for Culture model.

    Attributes:
        list_display (tuple): Fields to display in the admin list view.
        list_filter (tuple): Fields to filter by in the admin list view.
        search_fields (tuple): Fields to search in the admin list view.
    """

    list_display = ("id", "name")
    list_filter = ("name",)
    search_fields = ("name",)


class ArtifactAdmin(admin.ModelAdmin):
    """
    Admin interface options for Artifact model.

    Attributes:
        list_display (tuple): Fields to display in the admin list view.
        list_filter (tuple): Fields to filter by in the admin list view.
        search_fields (tuple): Fields to search in the admin list view.
    """

    list_display = ("id", "description")
    list_filter = ("id",)
    search_fields = ("description",)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Shape, ShapeAdmin)
admin.site.register(Culture, CultureAdmin)
admin.site.register(Artifact, ArtifactAdmin)
admin.site.register(Model)
admin.site.register(Thumbnail)
admin.site.register(Image)
admin.site.register(Institution)
admin.site.register(BulkDownloadingRequest)
admin.site.register(Request)
