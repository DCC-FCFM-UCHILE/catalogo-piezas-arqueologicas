"""
This module contains views for the user authentication system.

It includes the LoginView class, which provides an API endpoint for user login. The LoginView
handles POST requests, authenticating users based on username and password, and returns a token
for authenticated sessions.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from piezas.models import CustomUser
from .serializer import UserSerializer


class LoginView(APIView):
    """
    API View for user login.

    This view handles POST requests to authenticate users. It expects an username and password
    in the request data, validates them, and returns a token for authenticated sessions along
    with user data if the credentials are valid.
    """

    def post(self, request):
        """
        Authenticate a user based on username and password.

        This method checks if the request data includes 'username' and 'password'.

        Args:
            request (HttpRequest): The request object containing the username and password.

        Returns:
            Response: A DRF Response object with the authentication token and user data if the login
            is successful, or an error message if the login fails.
        """

        if "username" not in self.request.data or "password" not in self.request.data:
            return Response(
                {"detail": "Ingrese usuario y contraseña"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = CustomUser.objects.get(username=request.data["username"])
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        if not user.check_password(self.request.data["password"]):
            return Response(
                {"detail": "Contraseña incorrecta"}, status=status.HTTP_404_NOT_FOUND
            )
        token, _ = Token.objects.get_or_create(user=user)
        data = UserSerializer(instance=user).data
        return Response({"token": token.key, "user": data}, status=status.HTTP_200_OK)
