import React, { useEffect, useState } from "react";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { Button, Checkbox, CircularProgress, Divider, styled } from "@mui/material";
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

    
    return (
        <div>
            <Button onClick={() => window.history.back()}>Volver</Button>
        <h1>Detalle Solicitud: {request.name}</h1>
        <p>Estado: {request.status}</p>
        <p>Mensaje del usuario: {request.comments}</p>
        <p>Número de piezas solicitadas: {requested.length}</p>
        <Divider />
        {request.status == "pending" ? 
        <>
            <InLineDiv>
                <p></p>
                <p></p>
                <p>Aceptar todo</p>
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
            </InLineDiv>
            {requested.map((r) => (
                <CheckCard key={r.id} r={r} handleStatusChange={handleStatusChange} />
            ))}

            <ButtonsContainer>
                <GreenButton onClick={() => setShowModal(true)}>
                        Aceptar seleccionados
                    </GreenButton>
                <RedButton onClick={handleSubmitReject}>
                    Rechazar todo
                </RedButton>
            </ButtonsContainer>
        </> :
        <>
            {requested.map((r) => (
                <StatusCard key={r.id} r={r} />
            ))}
        </>
        }

        {showModal && (
            <Modal>
                {loading ?
                <ModalContent>
                    <CircularProgress size={80} />
                    <p>Enviando...</p>
                </ModalContent>
                :
                <ModalContent>
                    {requested.every((r) => r.status === "accepted") ?
                    <p>¿Estás seguro de que deseas aceptar los objetos seleccionados?</p>
                    :
                    <>
                        <p>Introduce un mensaje para el usuario con el motivo de el rechazo o aceptación de los objetos seleccionados</p>
                        <textarea
                            placeholder="Mensaje"
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            style={{minHeight: "5rem"}}
                            maxLength={500}
                        />
                    </>
                    }
                    <br />
                    <RedButton onClick={() => setShowModal(false)}>Cancelar</RedButton>
                    <br />
                    <GreenButton onClick={handleSubmit}>Enviar</GreenButton>
                </ModalContent>
                }
            </Modal>
        )}
        </div>
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