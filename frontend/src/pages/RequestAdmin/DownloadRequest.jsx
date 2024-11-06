import React, { useEffect, useState } from "react";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { Button } from "@mui/material";

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
            <h1>Requests</h1>
            {filteredRequests.map((request) => (
                <div key={request.id}>
                    <p>{request.name}</p>
                    <p>{request.email}</p>
                    <p>Solicita {request.request_count} {request.request_count == 1 ? "pieza" : "piezas"}.</p>
                    <p>{request.status}</p> {/* me gustaria usar el status como un if para poner logos señalando el status */}
                    <a href={"./downloadrequest/" + request.id}>Ver detalles</a>
                </div>
            ))}
        </div>
    );
}
export default DownloadRequest;