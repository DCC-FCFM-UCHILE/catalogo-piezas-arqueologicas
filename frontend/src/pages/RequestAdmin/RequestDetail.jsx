import React, { useEffect, useState } from "react";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { styled } from "@mui/material";


const RequestDetail = () => {
    const [request, setRequest] = useState({});
    const [requested, setRequested] = useState([]);
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
        setRequested(data.requested);
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
    
    return (
        <div>
            <button onClick={() => window.history.back()}>Volver</button>
        <h1>Detalle Solicitud: {request.name}</h1>
        <p>Estado: {request.status}</p>
        <p>Número de piezas solicitadas: {requested.length}</p>
        {request.status == "pending" ? 
        <>
            {requested.map((r) => (
                <Tile key={r.id}>
                    <p>{r.name}</p>
                    <p>{r.artifact}</p>
                    {/* <p>{r.status}</p> */}
                    <CheckBox
                        onClick={() => handleStatusChange(r.id, r.status)}
                        value={r.status == "accepted"}
                    />
                </Tile>
            ))}

            <button>
                Aceptar seleccionados
            </button>
            <button>
                Rechazar todo
            </button>
        </> :
        <>
            {requested.map((r) => (
                <Tile key={r.id}>
                    <p>{r.name}</p>
                    <p>{r.artifact}</p>
                    <p>{r.status}</p>
                </Tile>
            ))}
        </>
        }
        
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

export default RequestDetail;