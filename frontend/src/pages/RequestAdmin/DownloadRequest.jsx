import React, { useEffect, useState } from "react";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { Button, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider, Typography, Box, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DoneIcon from '@mui/icons-material/Done';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import { green, pink, yellow, lightBlue } from '@mui/material/colors'; // Importa los colores


const DownloadRequest = () => {
    const { token } = useToken();
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [filter, setFilter] = useState("");
    
    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (filter === "") {
            setFilteredRequests(requests);
        } else {
            setFilteredRequests(
                requests.filter((request) =>
                    request.status.toLowerCase().includes(filter.toLowerCase())
                )
            );
        }
    }, [filter, requests]);

    const fetchRequests = async () => {
        const response = await fetch(`${API_URLS.DETAILED_ARTIFACT}/requests`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            console.error("Failed to fetch requests");
            return;
        }
        const data = await response.json();
        setRequests(data.data);
        console.log(data.data);
    };
    const translateStatus = (status) => {
        switch (status.toLowerCase()) {
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
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case "accepted":
                return <DoneIcon />;
            case "pending":
                return <HourglassEmptyIcon />;
            case "partiallyaccepted":
                return <DoneIcon />;
            case "rejected":
                return <CloseIcon />;
            case "downloaded":
                return <DownloadDoneIcon />;
            default:
                return <MoreHorizIcon />;
        }
    };
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "accepted":
            case "downloaded":
                return green[100];
            case "pending":
                return lightBlue[100];
            case "partiallyaccepted":
                return yellow[100];
            case "rejected":
                return pink[100];
            default:
                return "transparent";
        }
    };
    const getHeaderText = (filter) => {
        switch (filter) {
            case "accepted":
                return "Solicitudes Aceptadas";
            case "pending":
                return "Solicitudes Pendientes";
            case "partiallyaccepted":
                return "Solicitudes Parcialmente Aceptadas";
            case "rejected":
                return "Solicitudes Rechazadas";
            case "downloaded":
                return "Solicitudes Descargadas";
            default:
                return "Todas las Solicitudes";
        }
    };
    return (
        <div>
            <Box textAlign="left" py={3} mx={4}>
                <Typography variant="h4" component="h1">
                    Administración de Solicitudes
                </Typography>
            </Box>
            <Divider />
            <Box display="flex" flexDirection="row">
                <Box width="20%" padding={2}>
                <List>
                        <ListItemButton selected={filter === ""} onClick={() => setFilter("")}>
                            <ListItemText primary="Todas" />
                        </ListItemButton>
                        <ListItemButton selected={filter === "pending"} onClick={() => setFilter("pending")}>
                            <ListItemText primary="Pendientes" />
                        </ListItemButton>
                        <ListItemButton selected={filter === "accepted"} onClick={() => setFilter("accepted")}>
                            <ListItemText primary="Aceptadas" />
                        </ListItemButton>
                        <ListItemButton selected={filter === "partiallyaccepted"} onClick={() => setFilter("partiallyaccepted")}>
                            <ListItemText primary="Parcialmente aceptadas" />
                        </ListItemButton>
                        <ListItemButton selected={filter === "rejected"} onClick={() => setFilter("rejected")}>
                            <ListItemText primary="Rechazadas" />
                        </ListItemButton>
                        <ListItemButton selected={filter === "downloaded"} onClick={() => setFilter("downloaded")}>
                            <ListItemText primary="Descargadas" />
                        </ListItemButton>
                    </List>
                </Box>
                
                <Divider orientation="vertical" flexItem />

                <Box width="80%" padding={2} my={2}>
                    <Typography variant="h5">{getHeaderText(filter)}</Typography>
                    <List>
                        {filteredRequests.map((request) => (
                            <React.Fragment>
                                <ListItem>
                                    <IconButton component="a" href={`./downloadrequest/${request.id}`} sx={{marginRight: 2} }>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <ListItemText
                                        primary={`${request.name}: Solicita ${request.request_count} ${request.request_count === 1 ? "pieza" : "piezas"}`}
                                        secondary={
                                            <>
                                            Estado: <Box component="span" sx={{ backgroundColor: getStatusColor(request.status), padding: '0 4px', borderRadius: '4px' }}>
                                                {translateStatus(request.status)}
                                            </Box>
                                            </>
                                        }
                                    />
                                    <ListItemIcon>
                                        {getStatusIcon(request.status)}
                                    </ListItemIcon>   
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            </Box>
        </div>
    );
}
export default DownloadRequest;