import React from "react";
import { Box, Typography, Button, List, ListItem, Divider, Container } from "@mui/material";
import { useSelection } from "../../../selectionContext";

const RequestDetails = ({ onRequestDownload }) => {
  const { selectedArtifacts, setEmptyList } = useSelection();

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
    </Box>
  );
};

export default RequestDetails;
