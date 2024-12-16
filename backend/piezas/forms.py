"""
This module extends Django's built-in user forms to accommodate a custom user model.

It defines two forms for creating and modifying instances of a CustomUser model. 
These forms are used within the Django admin site or any view that requires user 
creation or modification functionality with fields specific to the CustomUser model.

Classes:
    CustomUserCreationForm: A form for creating new users.

    CustomUserChangeForm: A form for updating existing users. 

Both forms inherit from Django's built-in UserCreationForm and UserChangeForm, 
respectively, ensuring that user instances are properly created and modified 
within the framework's user management system.
"""

from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    """
    A form for creating new users. Includes all the required
    fields, plus a repeated password.

    Attributes:
        Meta: A class containing configuration for this form class.
    """

    class Meta:
        """
        Configuration class for CustomUserCreationForm.

        Specifies the model to be used as the basis for the form and the fields that can
        be included. This configuration is used to ensure that the form allows for the
        creation of new CustomUser instances with the specified fields.

        Attributes:
            model (CustomUser): The model that this form will create instances of.
            fields (tuple): The fields to be included in the form. This includes 'username',
                'role', 'rut', 'institution', 'email', 'password1', and 'password2', allowing for
                comprehensive user creation.
        """

        model = CustomUser
        fields = (
            "username",
            "role",
            "rut",
            "institution",
            "email",
            "password1",
            "password2",
        )


class CustomUserChangeForm(UserChangeForm):
    """
    A form for updating existing users using the CustomUser model.

    Inherits from Django's UserChangeForm and specifies the CustomUser model and a
    subset of fields that can be edited. This form is typically used within the Django
    admin to allow administrators to edit existing user information, including custom
    fields defined in the CustomUser model.

    Attributes:
        Meta: A class containing configuration for this form class.
    """

    class Meta:
        """
        Configuration class for CustomUserChangeForm.

        Specifies the model to be used as the basis for the form and the fields that can
        be edited. This configuration is used to ensure that the form allows for editing
        of existing CustomUser instances with the specified fields.

        Attributes:
            model (CustomUser): The model that this form will edit instances of.
            fields (tuple): The fields that are editable in this form. This includes 'username',
                'role', 'rut', 'institution', 'email', focusing on the essential user information that
                might need to be updated.
        """

        model = CustomUser
        fields = ("username", "role", "rut", "institution", "email")
