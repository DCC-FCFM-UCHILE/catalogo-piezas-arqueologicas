import React, { useState } from "react";
import { API_URLS } from "../../../api";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Checkbox, Collapse, Divider, IconButton, styled, Typography } from "@mui/material";

function CheckCard({ r, handleStatusChange }) {
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <div key={r.id}>
            <Box sx={{ my: 1, display: 'flex', flexDirection: 'column',  }}>
                <InLineDiv>
                    <IconButton onClick={handleExpandClick}>
                        {expanded? <VisibilityOffIcon /> : <VisibilityIcon /> }
                    </IconButton>
                    <Typography>{r.artifact}</Typography>
                    <p>{r.description}</p>
                    
                    <Checkbox
                        onClick={(event) => {
                            event.stopPropagation();
                            handleStatusChange(r.id, r.status);
                        }}
                        checked={r.status === "accepted"}
                    />
                </InLineDiv>
                <Collapse in={expanded}>
                    <img 
                        src={`${API_URLS.BASE}${r.thumbnail}`}
                        alt={r.artifact}
                        style={{ width: "100%", borderRadius: "4px", maxWidth: "300px", marginLeft: "80px" }}
                    />
                </Collapse>
            </Box>
            <Divider aria-hidden="true"/>
        </div>
    );
}

const InLineDiv = styled("div")({
    display: "grid",
    gridTemplateColumns: "40px 40px 2fr 20px",
    alignItems: "center",
    width: "90%",
});

export default CheckCard;