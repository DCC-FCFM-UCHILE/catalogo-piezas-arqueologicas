import React, { useEffect, useState } from "react";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { Button, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider, Typography, Box, IconButton } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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
    return (
        <div>
            <div>
                <Button onClick={() => setFilter("")}>Todos</Button>
                <Button onClick={() => setFilter("pending")}>Pendientes</Button>
                <Button onClick={() => setFilter("accepted")}>Aceptados</Button>
                <Button onClick={() => setFilter("partiallyaccepted")}>Parcialmente aceptados</Button>
                <Button onClick={() => setFilter("rejected")}>Rechazados</Button>
                <Button onClick={() => setFilter("downloaded")}>Descargados</Button>
            </div>
            <Box textAlign="left" py={3} mx={4}>
                <Typography variant="h4" component="h1">
                    Administración de Solicitudes
                </Typography>
            </Box>
            <Divider />
            {filteredRequests.map((request) => (
                <div key={request.id}>
                    <p>{request.name}</p>
                    <p>{request.email}</p>
                    <p>Solicita {request.request_count} {request.request_count == 1 ? "pieza" : "piezas"}.</p>
                    <p>{request.status}</p> {/* me gustaria usar el status como un if para poner logos señalando el status */}
                    <a href={"./downloadrequest/" + request.id}>Ver detalles</a>
                </div>
            ))}
        <Box display="flex" flexDirection="row">
            {/* Side navigation */}
            <Box width="20%" padding={2}>
                <List>
                    <ListItemButton onClick={() => setFilter("")}>
                        <ListItemText primary="Todas" />
                    </ListItemButton>
                    <ListItemButton onClick={() => setFilter("pending")}>
                        <ListItemText primary="Pendientes" />
                    </ListItemButton>
                    <ListItemButton onClick={() => setFilter("accepted")}>
                        <ListItemText primary="Aceptadas" />
                    </ListItemButton>
                    <ListItemButton onClick={() => setFilter("partiallyaccepted")}>
                        <ListItemText primary="Parcialmente aceptadas" />
                    </ListItemButton>
                    <ListItemButton onClick={() => setFilter("rejected")}>
                        <ListItemText primary="Rechazadas" />
                    </ListItemButton>
                    <ListItemButton onClick={() => setFilter("downloaded")}>
                        <ListItemText primary="Descargadas" />
                    </ListItemButton>
                </List>
            </Box>
            
            <Divider orientation="vertical" flexItem />

            {/* Main content */}
            <Box width="80%" padding={2} my={2}>
                <Typography variant="h5">Solicitudes</Typography>
                <List>
                    {filteredRequests.map((request, index) => (
                        <React.Fragment key={index}>
                            <ListItem>
                                <ListItemText
                                    primary={`${request.user}: Solicita ${request.pieces} piezas.`}
                                    secondary={`Estado: ${request.status}`}
                                />
                                <ListItemIcon>
                                    <IconButton>
                                        <CheckCircleIcon />
                                    </IconButton>
                                    <IconButton>
                                        <CancelIcon />
                                    </IconButton>
                                    <IconButton>
                                        <MoreHorizIcon />
                                    </IconButton>
                                </ListItemIcon>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
                <Box mt={2} textAlign="center" className="floating-box">
                    <Typography variant="caption">
                        Tienes {filteredRequests.filter(req => req.status === "Pendiente").length} solicitudes pendientes
                    </Typography>
                </Box>
            </Box>
        </Box>
        </div>
    );
}
export default DownloadRequest;