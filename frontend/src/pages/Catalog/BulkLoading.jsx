import React, { useEffect, useState } from "react";
import {
    Container,
    Grid,
    Typography,
    Button,
    CircularProgress,
    Modal,
    Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import UploadButton from "../sharedComponents/UploadButton";
import { API_URLS } from "../../api";
import { useToken } from "../../hooks/useToken";
import { useSnackBars } from "../../hooks/useSnackbars";
import DownloadIcon from '@mui/icons-material/Download';


const FormContainer = styled(Container)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
});

const FormBox = styled(Box)({
    width: '100%',
    maxWidth: '700px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: '#fff',
});

const BulkLoading = () => {
    const { token } = useToken();
    const { addAlert } = useSnackBars();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(false);
    const [errorMessages, setErrorMessages] = useState({
        detail: "",
        errores: [],
    });
    const [match, setMatch] = useState(false);
    const [matchMessage, setMatchMessage] = useState({
        detail: "",
        posible_matches: [],
        temp_dir: "",
    });
    const [newObjectAttributes, setNewObjectAttributes] = useState({
        excel: {},
        zip: {},
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 
        const formData = new FormData();
        formData.append("excel", newObjectAttributes.excel);
        formData.append("zip", newObjectAttributes.zip);

        await fetch(`${API_URLS.DETAILED_ARTIFACT}/bulkloading`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }).then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    console.log(data);
                    if (data.posible_matches && data.posible_matches.length > 0) {
                        setMatchMessage({
                            detail: data.detail,
                            posible_matches: data.posible_matches || [],
                            temp_dir: data.temp_dir,
                        });
                        setMatch(true);
                    } else {
                        addAlert(data.detail);
                    }
                });
            } else {
                setErrors(true);
                response.json().then((data) => {
                    console.log(data);
                    setErrorMessages({
                        detail: data.detail,
                        errores: data.errores || [],
                    });
                });
            }
        })
        .catch((error) => {
            addAlert(error.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const handleSubmitMatch = async (e) => {
        e.preventDefault();
        setMatch(false);
        setLoading(true);
        //enviar la informacion de los match
        await fetch(`${API_URLS.DETAILED_ARTIFACT}/bulkloading`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(matchMessage),
        }).then((response) => {
            console.log(JSON.stringify(matchMessage));
            console.log(response);
            if (response.ok) {
                response.json().then((data) => {
                    console.log(data);
                    addAlert(data.detail);
                });
            } else {
                setErrors(true);
                response.json().then((data) => {
                    console.log(data);
                    setErrorMessages({
                        detail: data.detail,
                        errores: data.errores || [],
                    });
                });
            }
        })
        .catch((error) => {
            addAlert(error.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };



    useEffect(() => {
        if (matchMessage.posible_matches && matchMessage.posible_matches.length > 0) {
            matchMessage.posible_matches.forEach((element) => {
                element.new_artifact.status = "replace";
            })};
    }, [match]);

    return (
        <FormContainer>
            <FormBox component="form" onSubmit={handleSubmit}>
                <Grid container rowGap={4}>
                    <Grid item xs={12}>
                        <CustomTypography variant="h1">
                            Carga masiva
                        </CustomTypography>
                    </Grid>
                    <CustomBox>
                        <Typography variant="p">
                            Instrucciones para la carga masiva:
                        </Typography>
                        <br />
                        <Typography variant="p">
                            1. Descargar la plantilla de Excel.
                        </Typography>
                        <br />
                        <Typography variant="p">
                            2. Llenar la plantilla con la información correspondiente.
                        </Typography>
                        <br />
                        <Typography variant="p">
                            3. Subir la plantilla de Excel.
                        </Typography>
                        <br />
                        <Typography variant="p">
                            4. Subir archivo ZIP con la información multimedia.
                        </Typography>
                        <br />

                        {/* Caja para el formato del archivo ZIP con colores personalizados */}
                        <CustomBox
                            sx={{
                                p: 2,
                                border: '1px solid #d1d5db', // borde gris suave
                                borderRadius: '8px',
                                backgroundColor: '#e0f2fe', // azul claro
                                maxWidth: '500px',
                                mx: 'auto',
                                mt: 2
                            }}
                        > 
                            <Typography variant="subtitle1" gutterBottom>
                                <b>Formato requerido para la carpeta dentro del ZIP:</b> 
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                multimedia/
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 4 }}>
                                ├── thumbnails/
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 6 }}>
                                ├── 0001.png
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 6 }}>
                                └── 0002.png
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 4 }}>
                                └── models/
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 6 }}>
                                ├── 0001.obj
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 6 }}>
                                ├── 0001.obj.jpg
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 6 }}>
                                ├── 0001.obj.mtl
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 6 }}>
                                ├── 0002.obj
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 6 }}>
                                ├── 0002.obj.jpg
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 6 }}>
                                └── 0002.obj.mtl
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <b>Carpeta thumbnails:</b> contiene las previsualizaciones de las piezas. Es necesario que los nombres de los archivos coincidan con los ids del Excel.
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <b>Carpeta models:</b> contiene los modelos 3D (objeto .obj, textura .jpg, material .mtl). Los nombres deben coincidir con los ids del Excel.
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <b>Agregar imágenes:</b> si se desea agregar imágenes para un artefacto los nombres deben tener como prefijo el id del artefacto y ser agregados en la carpeta models.
                            </Typography>
                        </CustomBox>

                        <br />
                        <Typography variant="p">
                            5. Hacer clic en el botón "Subir".
                        </Typography>
                    </CustomBox>

                    <Button
                            variant="contained"
                            color="primary"
                            href="/plantilla.xlsx" // URL de la plantilla de Excel para
                            download
                            startIcon={<DownloadIcon />}
                        >
                            Descargar plantilla
                    </Button>
                    <Grid item xs={12}>
                        <ColumnGrid item xs={12} rowGap={2}>
                            <UploadButton
                                label="Excel *"
                                name="excel"
                                isRequired
                                setStateFn={setNewObjectAttributes}
                            />
                            <UploadButton
                                label="Zip *"
                                name="zip"
                                isRequired
                                setStateFn={setNewObjectAttributes}
                            />
                        </ColumnGrid>
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">
                            Subir
                        </Button>
                    </Grid>
                </Grid>
            </FormBox>

            <Modal open={loading}>
                <ModalBox>
                    <CircularProgress size={80} />
                    <LoadingText variant="h6">
                        Verificando el formato de sus archivos ...                        
                        Este proceso puede tomar unos minutos
                    </LoadingText>
                </ModalBox>
            </Modal>
            <Modal open={errors}>
                <ErrorBox>
                    <Typography variant="h6">
                        {errorMessages.detail}
                    </Typography>
                    {errorMessages.errores.map((error, index) => (
                        <ErrorText key={index} variant="p">
                            {error}
                        </ErrorText>
                    ))}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setErrors(false);
                            setErrorMessages({
                                detail: "",
                                errores: [],
                            })}}
                    >
                        Cerrar
                    </Button>
                </ErrorBox>
            </Modal>
            <Modal open={match}>
                <ErrorBox>
                    <Typography variant="h6">
                        {matchMessage.detail}
                    </Typography>
                    <Typography variant="h6">
                        Se encontraron posibles coincidencias con los siguientes artefactos:
                    </Typography>
                    {matchMessage.posible_matches.map((match, index) => (
                        <div>
                            <ErrorText key={index} variant="p">
                                La pieza {match.new_artifact.id} que intentaste puede ser la misma que la pieza: {match.match_artifact}
                            </ErrorText>
                            <Button
                                variant="contained"
                                color="primary"
                                href={`/catalog/${match.match_artifact}`}
                                target="_blank"
                            > Ver pieza
                            </Button>
                            <select name="status" id="status" onChange={(e) => {
                                match.new_artifact.status = e.target.value;
                            }}>
                                <option value="replace">Reemplazar la existente por la nueva</option>
                                <option value="keep">Mantener la existente y no crear la nueva</option>
                                <option value="new">Crear una nueva y mantener la existente</option>
                            </select>
                        </div>
                    ))}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitMatch}
                    >
                        Enviar
                    </Button>
                </ErrorBox>
            </Modal>
        </FormContainer>
    );
};

const CustomTypography = styled(Typography)({
    textAlign: "center",
    marginBottom: "1rem",
});

const CustomBox = styled("div")(({ theme }) => ({
    border: "1px solid #000",
    padding: "1rem",
    borderRadius: "0.5rem",
    width: "100%",
}));

const ColumnGrid = styled(Grid)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
}));

const ModalBox = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: theme.shadows[5],
    width: "400px", // Ajustar el tamaño del modal
    height: "300px", // Ajustar la altura
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
}));

const ErrorBox = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: theme.shadows[5],
    width: "400px", // Ajustar el tamaño del modal
    height: "80vh", // Ajustar la altura
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    overflowY: "auto",

    // Estilos para la barra de desplazamiento
    "&::-webkit-scrollbar": {
        width: "8px", // Ancho de la barra de desplazamiento
    },
    "&::-webkit-scrollbar-track": {
        background: "#f1f1f1", // Color del fondo de la pista
        borderRadius: "10px", // Opcional para darle un diseño más redondeado
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#888", // Color de la barra de desplazamiento
        borderRadius: "10px", // Opcional para una barra redondeada
    },
    "&::-webkit-scrollbar-thumb:hover": {
        background: "#555", // Color de la barra al hacer hover
    }
}));

const LoadingText = styled(Typography)({
    marginTop: "3rem",
    fontSize: "1.2rem",
    textAlign: "center",
});

const ErrorText = styled(Typography)({
    fontSize: "1rem",
    textAlign: "justify",
    width: "100%",
    marginTop: "0.1rem",
    marginBottom: "0.1rem",
});

export default BulkLoading;
