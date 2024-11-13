import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";
import { useToken } from "../../hooks/useToken";
import { API_URLS } from "../../api";
import { useSnackBars } from "../../hooks/useSnackbars";

/**
 * The Login component provides a form for users to log in.
 * Upon successful login, it sets the authentication token and redirects the user.
 * @returns {JSX.Element} Component for user login.
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAlert } = useSnackBars();
  const { setToken } = useToken();

  // State to manage form input values
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });

  // State to store the admin email
  const [adminEmail, setAdminEmail] = useState("");

   // Fetch admin email when component mounts
   useEffect(() => {
    const fetchAdminEmail = async () => {
      try {
        const response = await fetch(`${API_URLS.ADMIN_MAIL}`);
        const data = await response.json();
       
        setAdminEmail(data.admin_email);
      } catch (error) {
        console.error("Error fetching admin email:", error);
      }
    };

    fetchAdminEmail();
  }, []);

  // Function to handle changes in form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URLS.AUTH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        addAlert(data.detail);
        return;
      }

      // Set authentication token in local storage
      setToken(data.token.replace(/"/g, ""));

      // Redirect user to previous location or home page
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    } catch (error) {
      // Handle any errors that occurred during fetch
      addAlert("Ha ocurrido un error durante la autenticación");
    }
  };

  return (
    <CustomStack>
      {/* Title for the login page */}
      <CustomTypography variant="h1">Inicio de sesión</CustomTypography>
      
      {/* Form container */}
      <CustomBox
        component="form"
        autoComplete="off"
        onChange={handleChange}
        onSubmit={handleSubmit}
      >
        {/* username input field */}
        <TextField
          required
          id="username"
          name="username"
          label="Usuario"
          type="text"
          margin="normal"
          value={formValues.username}
        />
        
        {/* Password input field */}
        <TextField
          required
          id="password"
          name="password"
          label="Contraseña"
          type="password"
          margin="normal"
          value={formValues.password}
        />
        
        {/* Submit button */}
        <CustomButton variant="contained" color="primary" type="submit">
          Iniciar sesión
        </CustomButton>

        {/* Password recovery message */}
        <CustomTypography variant="body2" align="center" marginTop={2}>
          ¿Olvidaste tu contraseña? Envíanos un correo a <strong>{ adminEmail }</strong> para recuperar tu acceso.
        </CustomTypography>
      </CustomBox>
    </CustomStack>
  );
};

// Styled Stack component for centering content vertically
const CustomStack = styled(Stack)(({ theme }) => ({
  justifyContent: "center",
  alignItems: "center",
  rowGap: theme.spacing(1),
}));

// Styled Typography component for the page title
const CustomTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(3),
}));

// Styled Box component for containing the form elements
const CustomBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

// Styled Button component for the submit button
const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3.5),
}));

export default Login;

