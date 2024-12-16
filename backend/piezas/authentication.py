"""
This module customizes the token authentication mechanism provided by Django REST Framework.

By subclassing the `TokenAuthentication` class from Django REST Framework, it modifies the 
authentication keyword to "Bearer". 

"""

from rest_framework.authentication import TokenAuthentication as BaseTokenAuth


class TokenAuthentication(BaseTokenAuth):
    """
    Customizes the token authentication mechanism to use the "Bearer" token format.

    This class inherits from Django REST Framework's `TokenAuthentication` class,
    overriding the default authentication keyword from "Token" to "Bearer".
    This modification aligns the authentication scheme with the commonly used
    Bearer token format in Authorization headers for APIs, facilitating integration
    with clients and services that follow this standard.

    Attributes:
        keyword (str): The authentication keyword used in the Authorization header,
            set to "Bearer" to indicate the Bearer token format.
    """

    keyword = "Bearer"
