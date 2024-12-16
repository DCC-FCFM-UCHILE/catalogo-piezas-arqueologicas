from django.core.management.base import BaseCommand
from django.db import IntegrityError
from django.core.files import File
from django.conf import settings
from piezas.models import Thumbnail
import os
import logging

logger = logging.getLogger(__name__)
logger.setLevel("INFO")


class Command(BaseCommand):
    """
    This command imports thumbnails from a folder.

    Attributes:
        help (str): A short description of the command that is displayed when running
            'python manage.py help importThumbs'.
    """

    help = "Import thumbnails from a folder. The folder must contain photo type files."

    def handle(self, *args, **kwargs):
        """
        Executes the command to import thumbnails from a folder.
        """
        thumb_folder = settings.THUMBNAILS_FOLDER_PATH
        if not os.path.exists(thumb_folder):
            logger.error(f"Folder {thumb_folder} not found. Stop")
            return

        thumb_files = os.listdir(thumb_folder)
        for thumb_name in thumb_files:
            artifactId = thumb_name.split(".")[0]
            # If the file already exists, skip the creation of the model
            # This avoids the upload of the same thumbnail multiple times
            if os.path.exists(
                os.path.join(settings.MEDIA_ROOT, settings.THUMBNAILS_URL, thumb_name)
            ):
                logger.warning(
                    f"Skipping creation of {artifactId} thumbnail model due to existing file"
                )
                continue

            thumb_path = os.path.join(thumb_folder, thumb_name)
            with open(thumb_path, "rb") as thumbnail:
                try:
                    Thumbnail.objects.create(
                        id=int(artifactId),
                        path=File(thumbnail, name=thumb_name),
                    )
                    logger.info(f"Thumbnail {artifactId} added successfully")
                except IntegrityError:
                    logger.warning(
                        f"Thumbnail {artifactId} already exists. Skipping its creation"
                    )
                    continue
