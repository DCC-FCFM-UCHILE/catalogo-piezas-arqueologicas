import React, { useEffect, useState } from "react";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { Button, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider, Typography, Box, IconButton } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DoneIcon from '@mui/icons-material/Done';

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
                return <CheckCircleIcon />;
            default:
                return <MoreHorizIcon />;
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

                <Box width="80%" padding={2} my={2}>
                    <Typography variant="h5">{getHeaderText(filter)}</Typography>
                    <List>
                    {/* {filteredRequests.map((request) => (
                <div key={request.id}>
                    <p>{request.name}</p>
                    <p>{request.email}</p>
                    <p>Solicita {request.request_count} {request.request_count == 1 ? "pieza" : "piezas"}.</p>
                    <p>{request.status}</p>
                    <a href={"./downloadrequest/" + request.id}>Ver detalles</a>
                </div>
            ))} */}
                        {filteredRequests.map((request) => (
                            <React.Fragment>
                                <ListItem>
                                    <IconButton component="a" href={`./downloadrequest/${request.id}`} sx={{marginRight: 2} }>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <ListItemText
                                        primary={`${request.name}: Solicita ${request.request_count} ${request.request_count === 1 ? "pieza" : "piezas"}`}
                                        secondary={`Estado: ${translateStatus(request.status)}`}
                                    />
                                    <ListItemIcon>
                                        {getStatusIcon(request.status)}
                                    </ListItemIcon>   
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                    <Box textAlign="center" className="floating-box" sx={{ position: 'fixed', bottom: 30, right: 30 }}>
                        {/*Icono de solicitud */}
                        <IconButton>
                            <NotificationsActiveIcon />
                        </IconButton>
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