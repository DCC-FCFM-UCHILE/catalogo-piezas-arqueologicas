"""
This module contains a Django management command that creates groups and assigns permissions to them.
"""

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from piezas.models import CustomUser
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    This command creates groups and assigns permissions to them.

    Attributes:
        help (str): A short description of the command that is displayed when running
            'python manage.py help createGroups'.
    """

    help = "Creates specified groups and assigns permissions"

    def handle(self, *args, **options):
        """
        Executes the command to create groups and assign permissions.
        """
        groups = ["Funcionario", "Administrador"]
        for group_name in groups:
            group, created = Group.objects.get_or_create(name=group_name)

            if created:
                logger.info(f'Group "{group_name}" created successfully.')
            else:
                logger.warning(f'Group "{group_name}" already exists.')

            custom_user_content_type = ContentType.objects.get_for_model(CustomUser)

            if group_name == "Administrador":
                permissions = Permission.objects.all()
                group.permissions.set(permissions)

            else:
                permissions = permission_lists[group_name]

                for codename, name in permissions:
                    permission, perm_created = Permission.objects.get_or_create(
                        codename=codename,
                        name=name,
                        content_type=custom_user_content_type,
                    )
                    group.permissions.add(permission)

            group.save()
            logger.info(f'Permissions added to group "{group_name}"')

        logger.info("Successfully created groups and permissions")


permission_lists = {
    "Funcionario": [
        # Shape permissions
        ("view_shape", "Can view shape"),
        ("add_shape", "Can add shape"),
        ("change_shape", "Can change shape"),
        # Culture permissions
        ("view_culture", "Can view culture"),
        ("add_culture", "Can add culture"),
        ("change_culture", "Can change culture"),
        # Tag permissions
        ("view_tag", "Can view tag"),
        ("add_tag", "Can add tag"),
        ("change_tag", "Can change tag"),
        # Thumbnail permissions
        ("view_thumbnail", "Can view thumbnail"),
        ("add_thumbnail", "Can add thumbnail"),
        ("change_thumbnail", "Can change thumbnail"),
        # Model permissions
        ("view_model", "Can view model"),
        ("add_model", "Can add model"),
        ("change_model", "Can change model"),
        # Image permissions
        ("view_image", "Can view image"),
        ("add_image", "Can add image"),
        ("change_image", "Can change image"),
        # Artifact permissions
        ("view_artifact", "Can view artifact"),
        ("add_artifact", "Can add artifact"),
        ("change_artifact", "Can change artifact"),
        # Institution permissions
        ("view_institution", "Can view institution"),
        ("add_institution", "Can add institution"),
        ("change_institution", "Can change institution"),
    ],
}
