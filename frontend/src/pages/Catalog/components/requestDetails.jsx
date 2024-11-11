import React from "react";
import { Box, Typography, Button, List, ListItem, Divider, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelection } from "../../../selectionContext";
import BulkDownloadArtifactForm from './BulkDownloadingForm';
import DownloadArtifactButton from "../../ArtifactDetails/components/DownloadArtifactButton";
import { API_URLS } from "../../../api";
import { useToken } from "../../../hooks/useToken";
import { useSnackBars } from "../../../hooks/useSnackbars";

const RequestDetails = () => {
  const { selectedArtifacts, setEmptyList } = useSelection();
  const { token } = useToken();
  const loggedIn = !!token;
  const { addAlert } = useSnackBars();

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
          body: JSON.stringify({
            authenticated: true,
            artifacts: selectedArtifacts.map((artifact) => artifact.id),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        addAlert(data.detail);
        return;
      }

      if (data.bulk_request_id) {
        console.log(data.bulk_request_id);
      }

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

    } catch (error) {
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
        maxHeight: '90vh',
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
                <Typography variant="body1" sx={{ marginRight: 1 }}>Pieza {artifact.id}</Typography>
                
                {/* Añadimos las imágenes pequeñas aquí */}
                <IconContainer>
                  <img src='/eye.svg' alt="Icono 1" width={16} height={16} style={{ marginRight: 4 }} />
                  <img src='./delete.svg' alt="Icono 2" width={16} height={16} />
                </IconContainer>
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
            <DownloadArtifactButton text={"Solicitar datos"}>
              <BulkDownloadArtifactForm artifactInfoList={selectedArtifacts} />
            </DownloadArtifactButton>
          )}

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

// Estilo para alinear los iconos pequeños en línea
const IconContainer = styled("div")({
  display: "flex",
  gap: 8,
  marginLeft: "auto",
});

export default RequestDetails;


/*

{selectedArtifacts.length > 0 && (
        <Container sx={{ paddingBottom: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onRequestDownload}
            sx={{ marginBottom: 1 }}
          >
            Enviar Solicitud de Descarga
          </Button>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={setEmptyList}
          >
            Deshacer Solicitud
          </Button>
        </Container>
      )}

*/
