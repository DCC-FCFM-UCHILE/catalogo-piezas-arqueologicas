import React  from "react";
import { Box, Typography, Button, List, ListItem, Divider, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelection } from "../../../selectionContext";
import BulkDownloadArtifactForm from './BulkDownloadingForm'
import DownloadArtifactButton from "../../ArtifactDetails/components/DownloadArtifactButton";
import { API_URLS } from "../../../api";
import { useToken } from "../../../hooks/useToken";
import { useSnackBars } from "../../../hooks/useSnackbars";

/*

*/

const RequestDetails = () => {
  const { selectedArtifacts, setEmptyList } = useSelection();
  const { token } = useToken();
  const loggedIn = !!token;
  const { addAlert } = useSnackBars(); // Accesses addAlert function from SnackbarProvider
  
/**
   * Handles the download functionality for many artifacts.
   * Initiates download and displays alerts for success or failure.
   */


const handleDownload = async () => {
  try {
    const response = await fetch(
      `${API_URLS.DETAILED_ARTIFACT}/bulkdownloading`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body : JSON.stringify({
            authenticated:true,
            artifacts: selectedArtifacts.map((artifact) => artifact.id), // send all artifact's id
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      addAlert(data.detail);
      return;
    }
    if(data.bulk_request_id){
      console.log(data.bulk_request_id)
    }
    // Verifica si la solicitud fue exitosa y muestra una alerta
    if (!response.ok) {
      addAlert(data.detail);
      return;
    }
    // If the first fetch was successful, proceed with downloading the artifacts

    const downloadResponse = await fetch(
      `${API_URLS.DETAILED_ARTIFACT}/${data.bulk_request_id}/bulkdownloading`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const url = window.URL.createObjectURL(
      new Blob([await downloadResponse.blob()])
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `bulk_artifacts.zip`;
    link.click();
    link.remove();
    addAlert("Descarga exitosa");
    
  }
  
  catch (error) {
    addAlert("Error al descargar pieza");
  }
    
};


  return (
    <Box
      sx={{
        padding: 2,
        width: 300,
        borderLeft: "1px solid #ddd",
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh', // Limita la altura total del componente
        overflow: 'hidden',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Detalle de la Solicitud
      </Typography>

      {selectedArtifacts.length > 0 ? (
        <List sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '60vh', marginBottom: 2 }}>
          {selectedArtifacts.map((artifact) => (
            <React.Fragment key={artifact.id}>
              <ListItem>
                <Typography variant="body1">Pieza {artifact.id}</Typography>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1, paddingBottom: 2 }}>
          No hay elementos seleccionados.
        </Typography>
      )}
    {selectedArtifacts.length > 0 && (
      <Container sx={{ paddingBottom: 2 }}>
        {loggedIn ? (
          // Botón para descargar si está logeado
          <HorizontalStack>
            <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleDownload}
            >
              Descargar Piezas
            </Button>
          </HorizontalStack>
        ) : (
          // request form if the person is not logged.
          <DownloadArtifactButton text={"Solicitar datos"}>
            <BulkDownloadArtifactForm artifactInfoList={selectedArtifacts} />
          </DownloadArtifactButton>
          
        )}

        {/* Botón para deshacer solicitud que siempre se muestra si hay elementos seleccionados */}
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={setEmptyList}
          sx={{ marginTop: 1 }}
        >
          Deshacer Solicitud
        </Button>
      </Container>
)}
      
    </Box>
  );
};

const HorizontalStack = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: theme.spacing(1),
}));
export default RequestDetails;

