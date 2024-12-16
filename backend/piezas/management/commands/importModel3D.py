"""
This module contains a Django management command to import 3D models from a folder.
"""

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from django.db import IntegrityError
from piezas.models import Model

import os
import logging

logger = logging.getLogger(__name__)
logger.setLevel("INFO")


class Command(BaseCommand):
    """
    This command imports 3D models from a folder.

    Attributes:
        help (str): A short description of the command that is displayed when running
            'python manage.py help importModel3D'.
    """

    help = "Import 3D models from a folder. The folder must contain .obj, .mtl and .png files with the same name."

    def handle(self, *args, **kwargs):
        """
        Executes the command to import 3D models from a folder.
        """
        model_folder = settings.MODEL_FOLDER_PATH
        if not os.path.exists(model_folder):
            logger.error(f"Folder {model_folder} not found. Stop")
            return

        folder_files = os.listdir(model_folder)

        # List files in the folder
        textures = [
            file
            for file in folder_files
            if file.lower().endswith((".png", ".jpg", ".jpeg"))
        ]
        objects = [file for file in folder_files if file.lower().endswith(".obj")]
        materials = [file for file in folder_files if file.lower().endswith(".mtl")]

        # Pair files by their base name
        file_pairs = {}

        for texture in textures:
            base_name = os.path.splitext(texture)[0]
            base_name_id = base_name.split(".")[0]  # get 'texture1' from 'texture1.png'
            file_pairs[base_name_id] = {"texture": texture}

        for obj in objects:
            base_name = os.path.splitext(obj)[0]
            base_name_id = base_name.split(".")[0]  # get 'object1' from 'object1.obj'
            if base_name_id in file_pairs:
                file_pairs[base_name_id]["object"] = obj

        for material in materials:
            base_name = os.path.splitext(material)[0]
            base_name_id = base_name.split(".")[
                0
            ]  # get 'material1' from 'material1.mtl'
            if base_name_id in file_pairs:
                file_pairs[base_name_id]["material"] = material

        # Upload files and create 3D model
        for base_name_id, files in file_pairs.items():
            texture_file = files.get("texture")
            object_file = files.get("object")
            material_file = files.get("material")

            if texture_file and object_file and material_file:
                # If any of the files already exists, skip the creation of the model
                # This avoids the upload of the same texture, object or material multiple times
                if (
                    os.path.exists(
                        os.path.join(
                            settings.MEDIA_ROOT, settings.MATERIALS_URL, texture_file
                        )
                    )
                    or os.path.exists(
                        os.path.join(
                            settings.MEDIA_ROOT, settings.OBJECTS_URL, object_file
                        )
                    )
                    or os.path.exists(
                        os.path.join(
                            settings.MEDIA_ROOT, settings.MATERIALS_URL, material_file
                        )
                    )
                ):
                    logger.warning(
                        f"Skipping creation of {base_name_id} model due to the existing texture, object or material file"
                    )
                    continue

                texture_path = os.path.join(model_folder, texture_file)
                object_path = os.path.join(model_folder, object_file)
                material_path = os.path.join(model_folder, material_file)

                with open(texture_path, "rb") as tex_file, open(
                    object_path, "rb"
                ) as obj_file, open(material_path, "rb") as mat_file:
                    # Create model object and upload files
                    try:
                        Model.objects.create(
                            id=int(base_name_id),
                            texture=File(tex_file, name=os.path.basename(texture_path)),
                            object=File(obj_file, name=os.path.basename(object_path)),
                            material=File(
                                mat_file, name=os.path.basename(material_path)
                            ),
                        )
                        logger.info(
                            f"Successfully imported {texture_file}, {object_file}, {material_file}"
                        )
                    except IntegrityError:
                        logger.warning(
                            f"Model {base_name_id} already exists. Skipping its creation"
                        )
                        continue
            else:
                logger.warning(
                    f"Skipping creation of {base_name_id} model due to the missing object or corresponding material file"
                )
                continue
