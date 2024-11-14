import React from "react";
import { Box, Typography, Button, List, ListItem, Divider, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelection } from "../../../selectionContext";
import { API_URLS } from "../../../api";
import { useToken } from "../../../hooks/useToken";
import { useSnackBars } from "../../../hooks/useSnackbars";
import { useNavigate } from "react-router-dom";
import BulkDownloadArtifactForm from "./BulkDownloadArtifactForm";
import DownloadArtifactButton from "../../ArtifactDetails/components/DownloadArtifactButton";

const RequestDetails = () => {
  const { selectedArtifacts, setEmptyList,removeById } = useSelection();
  const { token } = useToken();
  const loggedIn = !!token;
  const { addAlert } = useSnackBars();
  const navigate = useNavigate();

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
        maxHeight: '80vh',
        overflowy: 'auto',
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

              <IconContainer>
                <img src='/eye.svg' alt="Icono 1" width={16} height={16} style={{ marginRight: 4 }} onClick={() => navigate(`/catalog/${artifact.id}`)}/>
                <img src='./delete.svg' alt="Icono 2" width={16} height={16} onClick={() => removeById(artifact.id)}  />
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
            <DownloadArtifactButton text = {"Solicitar datos"}>
              <BulkDownloadArtifactForm artifactInfoList={selectedArtifacts}></BulkDownloadArtifactForm>
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

const IconContainer = styled("div")({
  display: "flex",
  gap: 8,
  marginLeft: "auto",
  img: {
    cursor: "pointer",
    padding: 4, // Agregamos un poco de espacio para hacerlo clickeable
    borderRadius: "50%", // Opcional: puedes cambiar el diseño
    transition: "background-color 0.3s, transform 0.3s", // Efecto de transición suave
  },
  
  "img:hover": {
    backgroundColor: "#f0f0f0", // Color de fondo claro al pasar el mouse
    transform: "scale(1.2)", // Hace un zoom ligero
  },
});


export default RequestDetails;
