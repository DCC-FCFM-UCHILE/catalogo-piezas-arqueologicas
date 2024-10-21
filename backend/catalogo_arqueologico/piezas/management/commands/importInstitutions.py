"""
This module contains the command that imports institutions from a CSV file.
"""

from django.core.management.base import BaseCommand
from django.db import IntegrityError
from django.conf import settings
from piezas.models import Institution
import os
import logging
import csv

logger = logging.getLogger(__name__)
logger.setLevel("INFO")


class Command(BaseCommand):
    """
    This command reads csv with institutions. It can be specified which column is the one with the name by using a zero-based numbering.

    Attributes:
    help (str): A short description of the command that is displayed when running
    'python manage.py help importInstitutions'.
    """

    help = "This command reads csv with institutions. It can be specified which column is the one with the name by using a zero-based numbering."

    def add_arguments(self, parser):
        """
        Adds the column argument to the command.

        Args:
        parser (ArgumentParser): The parser that will receive the arguments.
        """
        parser.add_argument(
            "--column",
            type=int,
            default=1,
            help="The column number (zero-based) containing the institution name. Default is 3.",
        )

    def handle(self, *args, **kwargs):
        """
        Executes the command to import institutions from a CSV file.
        """
        file = settings.INSTITUTIONS_CSV_PATH
        column = kwargs["column"]

        if not os.path.exists(file):
            logger.error(f"File {file} not found. Stop")
            return

        with open(file, "r", encoding="utf-8") as archivo_csv:
            institutions = csv.reader(archivo_csv, delimiter=",")
            for institution in institutions:
                try:
                    recentlyAdded = Institution.objects.create(name=institution[column])
                    logger.info(f"Institution {recentlyAdded.name} created")
                except IntegrityError:
                    logger.info(
                        f"Institution {institution[column]} already exists. Skipping its creation"
                    )
                    continue
