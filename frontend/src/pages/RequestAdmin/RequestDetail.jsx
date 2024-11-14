import React, { useEffect, useState } from "react";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { Box, Button, Checkbox, CircularProgress, Divider, styled, Typography, TextField} from "@mui/material";
import CheckCard from "./components/CheckCard";
import StatusCard from "./components/StatusCard";


const RequestDetail = () => {
    const [request, setRequest] = useState({});
    const [loading, setLoading] = useState(false);
    const [requested, setRequested] = useState([]);
    const [msg, setMsg] = useState("");
    const [showModal, setShowModal] = useState(false);
    const { token } = useToken();

    useEffect(() => {
        //obtener el id de la url
        const id = window.location.pathname.split("/")[2];
        fetchRequest(id);
    }, []);

    useEffect(() => {
        requested.forEach(request => {
            if (request.status == "pending") {
                request.status = "rejected";
            }
        });
        console.log(requested);
    }, [requested]);

    const fetchRequest = async (id) => {
        const response = await fetch(`${API_URLS.DETAILED_ARTIFACT}/request/${id}`, {
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
        setRequest(data.data);
        setRequested(data.data.requests);
        console.log(data);
    }

    const handleStatusChange = (id, s) => {
        // Update the status of the request with the given id
        setRequested((prevRequests) =>
            prevRequests.map((request) =>
                request.id === id
                    ? { ...request, status: s === "accepted" ? "rejected" : "accepted" }
                    : request
            )
        );
    };

    const handleAcceptAll = () => {
        setRequested((prevRequests) =>
            prevRequests.map((request) => ({ ...request, status: "accepted" }))
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        const response = await fetch(`${API_URLS.DETAILED_ARTIFACT}/request/${request.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requests: requested,
                message: msg,
            }),
        });
        if (!response.ok) {
            setLoading(false);
            console.error("Failed to update request");
            return;
        }
        const data = await response.json();
        await fetchRequest(request.id);
        setShowModal(false);
        setLoading(false);
    }

    const handleSubmitReject = async () => {
        setRequested((prevRequests) =>
            prevRequests.map((request) => ({ ...request, status: "rejected" }))
        );
        setShowModal(true);
    }

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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }


    return (
        <Box p={4}>
            <Box display="flex" justifyContent="flex-start" mb={2}>
                <Button variant="text" color="primary" onClick={() => window.history.back()}>
                    Volver a Solicitudes
                </Button>
            </Box>
            <Typography variant="h4" gutterBottom>
                Detalle de la Solicitud
            </Typography>
            <Typography variant="h6">
                {request.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
                {request.email}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Solicita {requested.length} {requested.length === 1 ? "pieza" : "piezas"}.
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Estado: {translateStatus(request.status)}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Mensaje del Solicitante: {request.comments}
            </Typography>
            <Divider sx={{ my: 1 }} aria-hidden="true"/>
            {request.status === "pending" ? (
                <>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Typography variant="body1" mr={2} my={2}>
                            Seleccionar Todos
                        </Typography>
                        <Checkbox
                            onClick={(event) => {
                                event.stopPropagation();
                                if (requested.every((r) => r.status === "accepted")) {
                                    setRequested((prevRequests) =>
                                        prevRequests.map((request) => ({ ...request, status: "rejected" }))
                                    );
                                } else {
                                    handleAcceptAll();
                                }
                            }}
                            checked={requested.every((r) => r.status === "accepted")}
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={0}>
                        {requested.map((r) => (
                            <CheckCard key={r.id} r={r} handleStatusChange={handleStatusChange} />
                        ))}
                    </Box>
                    <Box display="flex" justifyContent="center" mt={2} gap={2}>
                        <GreenButton onClick={() => setShowModal(true)}>
                            Aceptar seleccionados
                        </GreenButton>
                        <RedButton onClick={handleSubmitReject}>
                            Rechazar todo
                        </RedButton>
                    </Box>
                </>
            ) : (
                <Box display="flex" flexDirection="column" gap={0}>
                    {requested.map((r) => (
                        <StatusCard key={r.id} r={r} />
                    ))}
                </Box>
            )}
            {showModal && (
                <Modal open={showModal} onClose={() => setShowModal(false)}>
                    <Box p={4} bgcolor="background.paper" borderRadius={2} boxShadow={3} mx="auto" my="20vh" width="50%">
                        {loading ? (
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <CircularProgress size={80} />
                                <Typography variant="body1" mt={2}>
                                    Enviando...
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {requested.every((r) => r.status === "accepted") ? (
                                    <Typography variant="body1">
                                        ¿Estás seguro de que deseas aceptar los objetos seleccionados?
                                    </Typography>
                                ) : (
                                    <>
                                        <Typography variant="h6" gutterBottom>
                                            Comentarios
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            Introduce un mensaje para el usuario con el motivo de el rechazo o aceptación de los objetos seleccionados
                                        </Typography>
                                        <TextField
                                            placeholder="Mensaje"
                                            value={msg}
                                            onChange={(e) => setMsg(e.target.value)}
                                            multiline
                                            rows={4}
                                            variant="outlined"
                                            fullWidth
                                            margin="normal"
                                            inputProps={{ maxLength: 500 }}
                                        />
                                    </>
                                )}
                                <Box display="flex" justifyContent="flex-end" mt={2}>
                                    <Button variant="outlined" color="secondary" onClick={() => setShowModal(false)} sx={{ mr: 2 }}>
                                        Cancelar
                                    </Button>
                                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                                        Enviar
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Modal>
            )}
        </Box>
    );
}

const InLineDiv = styled("div")({
    display: "grid",
    gridTemplateColumns: "40px 40px 2fr 20px",
    alignItems: "center",
    width: "90%",
});

const Modal = styled("div")({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
});

const ModalContent = styled("div")({
    backgroundColor: "#fff",
    padding: "1rem",
    borderRadius: "0.5rem",
    display: "flex",
    flexDirection: "column",
    height: "20rem",
    width: "20rem",
});

const ButtonsContainer = styled("div")({
    marginTop: "1rem",
    display: "flex",
    justifyContent: "space-evenly",
    width: "100%",
});

const RedButton = styled(Button)({
    backgroundColor: "#e57373",  // Rojo claro
    color: "white",
    "&:hover": {
        backgroundColor: "#d32f2f",  // Rojo más intenso al pasar el cursor
    },
});

// Botón verde refinado
const GreenButton = styled(Button)({
    backgroundColor: "#81c784",  // Verde claro
    color: "white",
    "&:hover": {
        backgroundColor: "#388e3c",  // Verde más intenso al pasar el cursor
    },
});

export default RequestDetail;