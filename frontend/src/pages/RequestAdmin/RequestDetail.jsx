import React, { useEffect, useState } from "react";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { styled } from "@mui/material";


const RequestDetail = () => {
    const [request, setRequest] = useState({});
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
        console.log(requested);
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
            console.error("Failed to update requests");
            return;
        }
        const data = await response.json();
        console.log(data);
    }

    const handleSubmitReject = async () => {
        setRequested((prevRequests) =>
            prevRequests.map((request) => ({ ...request, status: "rejected" }))
        );
        setShowModal(true);
    }

    
    return (
        <div>
            <button onClick={() => window.history.back()}>Volver</button>
        <h1>Detalle Solicitud: {request.name}</h1>
        <p>Estado: {request.status}</p>
        <p>Número de piezas solicitadas: {requested.length}</p>
        {request.status == "pending" ? 
        <>
            <button onClick={handleAcceptAll}>
                Aceptar todos
            </button>
            {requested.map((r) => (
                <Tile key={r.id}>
                    <p>{r.artifact}</p>
                    <p>{r.description}</p>
                    <img 
                        src={`${API_URLS.BASE}${r.thumbnail}`}
                        alt={r.artifact} /> {/* falta poner el ojo para que  */}
                    <CheckBox
                        onClick={() => handleStatusChange(r.id, r.status)}
                        value={r.status == "accepted"}
                    />
                </Tile>
            ))}

            <button onClick={()=> setShowModal(true)}>
                Aceptar seleccionados
            </button>
            <button onClick={handleSubmitReject}>
                Rechazar todo
            </button>
        </> :
        <>
            {requested.map((r) => (
                <Tile key={r.id}>
                    <p>{r.artifact}</p>
                    <p>{r.description}</p>
                    <img 
                        src={`${API_URLS.BASE}${r.thumbnail}`}
                        alt={r.artifact} />
                    <p>{r.status}</p>
                </Tile>
            ))}
        </>
        }

        {showModal && (
            <Modal>
                <ModalContent>
                    <p>Introduce un mensaje para el usuario con el motivo de el rechazo o aceptación de los objetos seleccionados</p>
                    <textarea
                        placeholder="Mensaje"
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        style={{minHeight: "5rem"}}
                        maxLength={500}
                    />
                    <br />
                    <button onClick={() => setShowModal(false)}>Cancelar</button>
                    <br />
                    <button onClick={handleSubmit}>Enviar</button>
                </ModalContent>
            </Modal>
        )}
        </div>
    );
}

const CheckBox = ({ onClick, value }) => (
    <input
        type="checkbox"
        onClick={onClick}
        checked={value}
        readOnly
    />
);

const Tile = styled("div")({
    border: "1px solid #000",
    padding: "1rem",
    margin: "1rem",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "0.5rem",
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

export default RequestDetail;