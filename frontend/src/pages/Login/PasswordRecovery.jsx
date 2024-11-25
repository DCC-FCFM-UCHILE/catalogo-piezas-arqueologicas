import React, { useState } from 'react';

const PasswordRecovery = () => {
    const [user, setUser] = useState('');
    const [message, setMessage] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/request-password-reset/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user }),
        });
        const data = await response.json();
        setMessage(data.message || 'Error al enviar el correo');
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Usuario:
                <input
                    type="usuario"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Enviar enlace de recuperación</button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default PasswordRecovery;