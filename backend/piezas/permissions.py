"""
This module defines custom permission classes for a Django REST Framework application, 
ensuring that only users belonging to specific groups can access certain views.

Classes:
- IsFuncionarioPermission: Grants permission to users who are part of the "Funcionario" group.
- IsAdminPermission: Grants permission to users who are part of the "Administrador" group.
"""

from rest_framework import permissions


class IsFuncionarioPermission(permissions.BasePermission):
    """
    Permission class to restrict access to users who are part of the "Funcionario" group.

    This class checks if the requesting user is a member of the "Funcionario" group and
    grants access accordingly.
    """

    def has_permission(self, request, view):
        """
        Checks if the requesting user belongs to the "Funcionario" group.

        Args:
        - request: HttpRequest object.
        - view: The view which is being accessed.

        Returns:
        - bool: True if the user is in the "Funcionario" group, False otherwise.
        """
        return request.user and request.user.groups.filter(name="Funcionario").exists()


class IsAdminPermission(permissions.BasePermission):
    """
    Permission class to restrict access to users who are part of the "Administrador" group.

    This class checks if the requesting user is a member of the "Administrador" group
    and grants access accordingly.
    """

    def has_permission(self, request, view):
        """
        Checks if the requesting user belongs to the "Administrador" group.

        Args:
        - request: HttpRequest object.
        - view: The view which is being accessed.

        Returns:
        - bool: True if the user is in the "Administrador" group, False otherwise.
        """
        return (
            request.user and request.user.groups.filter(name="Administrador").exists()
        )
