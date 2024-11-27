import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // For dynamic UID and token in URL
import { API_URLS } from "../../api";
const ResetPassword = () => {
    const { uidb64, token } = useParams();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_URLS.CONFIRM_RECOVER_PASSWORD,{
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uidb64:uidb64,
                    token:token,
                    new_password: password,
                })
            });
            if (!response.ok) {
                throw new Error('Failed to reset password'); // Handle HTTP errors
            }

            const data = await response.json();
            setMessage(data.message || 'Error al enviar el correo');

        } catch (error) {
            console.error(error);
            setMessage('Error resetting password. Please try again.');
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;
