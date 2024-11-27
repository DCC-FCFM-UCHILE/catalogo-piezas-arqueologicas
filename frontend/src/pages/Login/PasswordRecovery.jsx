import React, { useState } from 'react';
import { API_URLS } from "../../api";
const PasswordRecovery = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                API_URLS.RECOVER_PASSWORD,
                {
                    method: "POST",
                    headers:{
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({email})
                }
            )
            if (!response.ok) {
                throw new Error('Failed to reset password'); // Handle HTTP errors
            }
            const data = await response.json();
            setMessage(data.message || 'Error al enviar el correo');
        } catch (error) {
            setMessage('Error sending email. Check the address and try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Email:
                <input
                    type="email"
                    placeholder='Ingresa tu email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Enviar enlace de recuperación</button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default PasswordRecovery;