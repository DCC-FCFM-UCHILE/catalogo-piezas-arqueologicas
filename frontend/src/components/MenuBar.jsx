import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Button, Box, styled } from "@mui/material";
import { useToken } from "../hooks/useToken";
import { API_URLS } from "../api";

/**
 * MenuBar component represents the application's navigation bar.
 * It includes buttons for navigating to different sections and handling user authentication.
 * Uses react-router-dom for navigation and useToken hook for managing authentication state.
 */
const MenuBar = () => {
  const { token, setToken } = useToken();
  const loggedIn = !!token;
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);
  
  const fetchNotifications = async () => {
    const response = await fetch(`${API_URLS.DETAILED_ARTIFACT}/requests/notification`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch notifications");
      return;
    }
    const data = await response.json();
    setNotifications(data.data);
    setAdmin(true);
    if (data.data > 0) {
      setShowNotifications(true);
    }
  };

/**
   * Navigates to the catalog page if not already on it.
   */
  const handleGoToCatalog = () => {
    // If we are already in the catalog page, do nothing
    if (location.pathname === "/catalog") {
      return;
    }
    navigate("/catalog");
  };

/**
   * Navigates to the new object creation page if not already on it.
   */
  const handleNewObjectClick = () => {
    // If we are already in the new object page, do nothing
    if (location.pathname === "/catalog/new") {
      return;
    }
    navigate("/catalog/new", {
      state: { from: location },
    });
  };

/**
 * Navigates to the bulk loading page if not already on it.
 */
  const handleBulkLoadingClick = () => {
    // If we are already in the bulk loading page, do nothing
    if (location.pathname === "/catalog/bulkloading") {
      return;
    }
    navigate("/catalog/bulkloading", {
      state: { from: location },
    });
  }

/**
 * Navigates to the download request page if not already on it.
 */
  const handleDownloadRequestClick = () => {
    // If we are already in the download request page, do nothing
    if (location.pathname === "/downloadrequest") {
      return;
    }
    navigate("/downloadrequest", {
      state: { from: location },
    });
  }
/**
   * Navigates to the login page.
   */
  const handleLoginClick = () => {
    navigate("/login", {
      state: { from: location },
    });
  };

/**
   * Logs out the user by resetting the token and navigating to the home page.
   */
  const handleLogout = () => {
    setToken(null);
    navigate("/");
  };

  return (
    <>
    <AppBar position="static">
      <Toolbar>
      {/* Left side of the AppBar */}
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="home"
            onClick={() => navigate("/")}
          >
            <img
              src={`${process.env.PUBLIC_URL}/logo.svg`}
              alt="logo"
              style={{ height: "40px" }}
            />
          </IconButton>
          <Button
            onClick={handleGoToCatalog}
            color="inherit"
            style={{ marginLeft: 55 }}
          >
            Catálogo
          </Button>
        </Box>
        {/* Right side of the AppBar */}
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent:"flex-end" }}>
          {/* Conditional rendering based on user authentication */}
          {loggedIn && (
            <>
            {admin && (
            <Button
              onClick={handleDownloadRequestClick}
              color="inherit"
              style={{ marginRight: 55 }}
            > Solicitudes de descarga
            </Button>
            )}
            <Button
              onClick={handleBulkLoadingClick}
              color="inherit"
              style={{ marginRight: 55 }}
            >
              Carga masiva
            </Button>
            <Button
              onClick={handleNewObjectClick}
              color="inherit"
              style={{ marginRight: 55 }}
            >
              Agregar pieza
            </Button>
            </>
          )}
          {!loggedIn ? (
            <Button color="inherit" onClick={handleLoginClick}>
              Iniciar sesión
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
    {(showNotifications && notifications > 0) && (
      <Modal>
        <button onClick={() => setShowNotifications(false)}>X</button>
        <p>Hay {notifications} {notifications === 1 ? "solicitud" : "solicitudes"} pendiente{notifications === 1 ? "" : "s"}</p>
        <button onClick={handleDownloadRequestClick}>Ver solicitudes</button>
      </Modal>
    )}
    </>
  );
};

const Modal = styled("div")({
  position: "fixed",
  bottom: 20,
  right: 20,
  backgroundColor: "#fff",
  padding: "1rem",
  borderRadius: "0.5rem",
  boxShadow: "0 0 1rem rgba(0, 0, 0, 0.1)",
  zIndex: 100,
  display: "flex",
});
export default MenuBar;
