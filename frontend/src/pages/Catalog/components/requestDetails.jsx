import React from "react";
import { Box, Typography, Button, List, ListItem, Divider, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelection } from "../../../selectionContext";
import DownloadArtifactForm from '../../ArtifactDetails/components/DownloadArtifactForm'
import DownloadArtifactButton from "../../ArtifactDetails/components/DownloadArtifactButton";
import { API_URLS } from "../../../api";
import { useToken } from "../../../hooks/useToken";

/*

*/

const RequestDetails = () => {
  const { selectedArtifacts, setEmptyList } = useSelection();
  const { token } = useToken();
  const loggedIn = !!token;

  const onRequestDownload = async () => {
    try {
      // Configuración de la solicitud POST con el token y los IDs de los artefactos
      const response = await fetch(`${API_URLS.DETAILED_ARTIFACT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          artifacts: selectedArtifacts.map((artifact) => artifact.id), // Enviar solo los IDs
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error en la solicitud de descarga:", data.detail || "Error desconocido");
        return;
      }

      console.log("Solicitud de descarga exitosa:", data.message || "Los archivos están siendo procesados");
      // Aquí puedes mostrar una alerta de éxito o realizar alguna otra acción con `data`
    } catch (error) {
      console.error("Error en la solicitud de descarga:", error);
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
            onClick={onRequestDownload}
            selectedArtifactsx={{ marginBottom: 1 }}
            >
              Descargar Piezas
            </Button>
          </HorizontalStack>
        ) : (
          // Botón para solicitar datos si no está logeado
          <Button>
            hola
          </Button>
          /*
          <DownloadArtifactButton text={"Solicitar datos"}>
            <DownloadArtifactForm artifactInfo={artifact} />
          </DownloadArtifactButton>
          */
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
