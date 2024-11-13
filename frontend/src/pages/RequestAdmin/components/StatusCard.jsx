import React, { useState } from "react";
import { API_URLS } from "../../../api";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Collapse, Divider, styled, IconButton, Typography} from "@mui/material";

function StatusCard({ r}) {
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const translateStatus = (status) => {
        switch (status) {
            case "accepted":
                return "Aceptada";
            case "pending":
                return "Pendiente";
            case "partiallyaccepted":
                return "Parcialmente Aceptada";
            case "rejected":
                return "Rechazada";
            case "downloaded":
                return "Descargada";
            default:
                return status;
        }
    };

    return (
        <div key={r.id}>
            <Box sx={{display: 'flex', flexDirection: 'column',  }}>
                <InLineDiv>
                    <IconButton onClick={handleExpandClick} sx={{ mr: 1 }}>
                        {expanded ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <Typography variant="body1" flexGrow={1}>{r.artifact}</Typography>
                    <Typography variant="body1" sx={{ mx: 2 }}>{r.description}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mx: 2 }}>{translateStatus(r.status)}</Typography>
                </InLineDiv>
                <Collapse in={expanded}>
                    <img
                        src={`${API_URLS.BASE}${r.thumbnail}`}
                        alt={r.artifact}
                        style={{ width: "100%", borderRadius: "4px", maxWidth: "300px", marginLeft: "80px", alignSelf: "left" }}
                    />
                </Collapse>
            </Box>
            <Divider sx={{ my: 1 }} aria-hidden="true"/>
        </div>
    );
}

const InLineDiv = styled("div")({
    display: "grid",
    gridTemplateColumns: "40px 40px 2fr 20px",
    alignItems: "center",
    width: "90%",
});

export default StatusCard;