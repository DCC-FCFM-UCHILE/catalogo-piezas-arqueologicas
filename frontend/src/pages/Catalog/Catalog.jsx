import React, { useState } from "react";


import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Skeleton,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArtifactCard from "./components/ArtifactCard";
import CatalogPagination from "./components/CatalogPagination";
import CatalogFilter from "./components/CatalogFilter";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import useFetchItems from "../../hooks/useFetchItems";
import {useSelection} from "../../selectionContext";
import RequestDetails from "./components/requestDetails"; 
import CloseIcon from '@mui/icons-material/Close'

/**
 * The Catalog component displays a catalog of artifacts with pagination and filtering options.
 * Users can view artifact cards, apply filters, and navigate through paginated results.
 * @returns {JSX.Element} Component for displaying the catalog.
 */
const Catalog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useToken();
  const loggedIn = !!token;

  // implement "selecion mode" and a select artifact list to download many artifacts 
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { selectedArtifacts, toggleSelection } = useSelection();
  // to manage the state of the download request details 
  const [isDetailsOpen,setDetailsOpen] = useState(false);

  //function to set the selection mode 
  const changeSelectionMode = () =>{
    console.log(isSelectionMode)
    if(isSelectionMode===true && isDetailsOpen===true){
      changeDetailsOpen();
    }
    setIsSelectionMode(!isSelectionMode)
  }
  const changeDetailsOpen = () =>{
    setDetailsOpen(!isDetailsOpen)
  }
 // Custom hook to fetch items (artifacts) from the API with pagination and filtering
  const {
    items: artifactList,
    loading,
    filter,
    setFilter,
    pagination,
    setPagination,
    options
  } = useFetchItems(API_URLS.ALL_ARTIFACTS);
  
  /**
   * Handles redirection to the add artifact page.
   */
  const handleRedirect = () => {
    navigate("/catalog/new", { state: { from: location } });
  };
  
  const handleRequestDownload = () => {
    console.log("Solicitud de descarga enviada para:", selectedArtifacts);
    // Aquí puedes agregar la lógica para enviar la solicitud a un API o backend
  };

  return (
    <Container>
      <Button variant="outlined" color="secondary" onClick={changeSelectionMode}>
            Selección Descarga Artefactos
      </Button>
      {isSelectionMode && <Button variant="outlined" color="secondary" onClick={changeDetailsOpen}>
          Ver Preselección
      </Button>}
      {/* Title of the catalog */}
      <CustomTypography variant="h1">Catálogo</CustomTypography>
      {/* Component for filtering artifacts */}
      <CatalogFilter filter={filter} setFilter={setFilter} options = {options} />
  {/* Button to add new artifact (visible to logged-in users) */}
      {loggedIn && (
        <CustomBox>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleRedirect}
          >
            Agregar pieza
          </Button>
        </CustomBox>
      )}
       {/* Loading state display with skeleton cards */}
      {loading ? (
        <Box>
          <Grid container spacing={2}>
            {Array.from({ length: 9 }, (_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" width="100%" height={200} />
              </Grid>
            ))}
          </Grid>
        </Box>
         // Displaying artifact cards if available
      ) : artifactList.length > 0 ? (
        <Box>
          <Grid container spacing={2}>
            {artifactList.map((artifact) => (
              <Grid item xs={12} sm={6} md={4} key={artifact.id}>
                <ArtifactCard 
                artifact={artifact}
                isSelectionMode={isSelectionMode}
                onSelectArtifact={toggleSelection}
                selected={selectedArtifacts.some(selected => selected.id === artifact.id)}
                />
              </Grid>
            ))}
          </Grid>
{/* Pagination component */}
          <CatalogPagination
            pagination={pagination}
            setPagination={setPagination}
          />
        </Box>
      ) : (
        <CustomBox>
          <Typography variant="p" align="center">
            No se encontraron resultados
          </Typography>
        </CustomBox>
      )}

      {/* download request */}
      
      <RequestDetailsPanel open={isDetailsOpen}>
        <IconButton onClick={()=> setDetailsOpen(false)} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
        <RequestDetails onRequestDownload={handleRequestDownload}></RequestDetails>
      </RequestDetailsPanel> 
    </Container>
  );
};

// Custom styled typography for the catalog title
const CustomTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(3),
  textAlign: "center",
}));

// Custom styled box for centering content
const CustomBox = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));
//Custom the request details information 
const RequestDetailsPanel = styled(Box)(({ theme, open }) => ({
  position: "fixed",
  top: 0,
  right: 0,
  height: "100%",
  width: "300px",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2),
  transform: open ? "translateX(0)" : "translateX(100%)",
  transition: "transform 0.3s ease",
  zIndex: 1300,
}));
export default Catalog;
