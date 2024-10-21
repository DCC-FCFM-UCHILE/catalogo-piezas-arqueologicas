import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate, Outlet, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import MenuBar from "./MenuBar";
import NotFound from "./NotFound";
import { useToken } from "../hooks/useToken";
import { CircularProgress } from "@mui/material";
import BulkLoading from "../pages/Catalog/BulkLoading";

// Lazy-loaded components
const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Login/Login"));
const Catalog = lazy(() => import("../pages/Catalog/Catalog"));
const CreateArtifact = lazy(() => import("../pages/Catalog/CreateArtifact"));
const ArtifactDetails = lazy(() => import("../pages/ArtifactDetails/ArtifactDetails"));
const EditArtifact = lazy(() =>
  import("../pages/ArtifactDetails/components/EditArtifact")
);

/**
 * PrivateRouteWrapper component checks if the user has a valid token.
 * If token exists, renders the child components using Outlet from react-router-dom.
 * If token doesn't exist, redirects to '/login' preserving the current location.
 */
const PrivateRouteWrapper = () => {
  const { token } = useToken();
  const location = useLocation();

  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

/**
 * Layout component represents the main layout structure of the application.
 * It includes a MenuBar and handles routing using react-router-dom.
 * Uses Suspense for lazy loading and CircularProgress for loading indication.
 */
const Layout = () => {
  return (
    <CustomGrid>
      <MenuBar />
      <Suspense
        fallback={
          <LoadingSpinner>
            <CircularProgress />
          </LoadingSpinner>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:artifactId" element={<ArtifactDetails />} />
          {/* Nested route for catalog with authorization check */}
          <Route element={<PrivateRouteWrapper />}>
            <Route path="/catalog/new" element={<CreateArtifact />} />
            <Route path="/catalog/bulkloading" element={<BulkLoading />} />
            <Route path="/catalog/:artifactId/edit" element={<EditArtifact />} />
          </Route>
          <Route path="*" element={<NotFound />} /> {/* Catch-all route for 404 */}
        </Routes>
      </Suspense>
    </CustomGrid>
  );
};

// CustomGrid styled component for setting layout background and minHeight
const CustomGrid = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.background.main,
  minHeight: "100vh",
}));

// LoadingSpinner styled component for centered loading indicator
const LoadingSpinner = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "50vh",
}));

export default Layout;
