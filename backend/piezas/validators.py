"""
This module contains a validator for data inputs specific to the 
application's requirements. 

The validator `validateRut` is designed to validate Chilean RUT (Rol Único Tributario) numbers. 
"""

from django.core.exceptions import ValidationError


def validateRut(rut):
    """
    Validates a chilean RUT (Rol Único Tributario) number.

    Args:
        rut (str): The RUT to validate.
    """
    if len(rut) != 9:
        raise ValidationError("Invalid identifier: Must be 9 characters long")
    last = rut[8]
    inverse = rut[7::-1]
    total = 0
    for number in range(8):
        total += int(inverse[number]) * (number % 6 + 2)
    rest = 11 - abs(total - 11 * (total // 11)) % 11
    if rest == 10 and last == "k":
        return None
    elif rest == int(last):
        return None
    else:
        if rest == 10:
            rest = "k"
        raise ValidationError(
            "Invalid identifier: Validation digit is "
            + str(last)
            + " and should be "
            + str(rest)
        )
