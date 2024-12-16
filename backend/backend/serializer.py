"""
This module defines serializers for the CustomUser model.

It includes the UserSerializer class, which extends the ModelSerializer class from 
Django REST Framework.
The UserSerializer class adds a custom field `full_name` to serialize the full name 
of a user by concatenating
the first name and last name of the CustomUser model instance.
"""

from piezas.models import CustomUser
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the CustomUser model.

    Includes a custom field `full_name` that concatenates the user's first and last name.

    Attributes:
        full_name (SerializerMethodField): A field to represent the user's full name.
    """

    full_name = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        """
        Returns the full name of the user.

        Args:
            obj (CustomUser): The user instance.

        Returns:
            str: The full name of the user.
        """
        return f"{obj.first_name} {obj.last_name}"

    class Meta:
        """
        Meta class to map serializer's fields with the model fields.
        """

        model = CustomUser
        fields = ["id", "username", "email", "full_name"]
