import React, { useState } from "react";
import { API_URLS } from "../../../api";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Collapse, styled } from "@mui/material";

function StatusCard({ r}) {
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <div key={r.id} expanded={expanded}>
            <InLineDiv>
                <VisibilityIcon onClick={handleExpandClick} />
                <p>{r.artifact}</p>
                <p>{r.description}</p>
                <p>{r.status}</p>
            </InLineDiv>
            <Collapse in={expanded}>
                <img 
                    src={`${API_URLS.BASE}${r.thumbnail}`}
                    alt={r.artifact}
                    style={{ width: "100%", borderRadius: "4px", maxWidth: "300px", marginLeft: "80px" }}
                />
            </Collapse>
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