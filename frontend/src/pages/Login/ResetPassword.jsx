import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // For dynamic UID and token in URL
import { API_URLS } from "../../api";
const ResetPassword = () => {
    const { uidb64, token } = useParams();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }
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
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <p style={styles.description}>Ingresa tu nueva contraseña y confírmala.</p>
                <label style={styles.label}>
                    Nueva contraseña:
                    <input
                        type="password"
                        placeholder="Ingresa nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Confirmar contraseña:
                    <input
                        type="password"
                        placeholder="Confirma nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </label>
                <button type="submit" style={styles.button}>
                    Restablecer contraseña
                </button>
                {message && <p style={styles.message}>{message}</p>}
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '300px',
    },
    description: {
        fontSize: '16px',
        marginBottom: '15px',
        color: '#333',
        textAlign: 'center',
    },
    label: {
        width: '100%',
        marginBottom: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    input: {
        width: '80%', // Ajusta el ancho al 80% del formulario
        padding: '10px',
        fontSize: '14px',
        marginTop: '5px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    button: {
        width: '80%', // Asegura que el botón sea del mismo tamaño que los inputs
        padding: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        textAlign: 'center',
    },
    message: {
        marginTop: '10px',
        color: '#e74c3c', // Rojo para errores
        fontSize: '14px',
        textAlign: 'center',
    },
};
export default ResetPassword;
