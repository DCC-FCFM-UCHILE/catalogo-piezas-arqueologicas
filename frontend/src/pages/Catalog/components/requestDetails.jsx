// RequestDetails.js
import React from "react";
import { Box, Typography, Button, List, ListItem, Divider } from "@mui/material";
import { useSelection } from "../../../selectionContext";

const RequestDetails = ({ onRequestDownload }) => {
  const { selectedArtifacts } = useSelection();

  return (
    <Box sx={{ padding: 2, width: 300, borderLeft: "1px solid #ddd" }}>
      <Typography variant="h6" gutterBottom>
        Detalle de la Solicitud
      </Typography>

      {selectedArtifacts.length > 0 ? (
        <List>
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
        <Typography variant="body2" color="textSecondary">
          No hay elementos seleccionados.
        </Typography>
      )}

      {selectedArtifacts.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onRequestDownload}
          sx={{ marginTop: 2 }}
        >
          Enviar Solicitud de Descarga
        </Button>
      )}
    </Box>
  );
};

export default RequestDetails;
