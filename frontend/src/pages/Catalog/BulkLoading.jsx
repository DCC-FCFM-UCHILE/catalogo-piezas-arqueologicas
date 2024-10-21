import React, { useState, useEffect } from "react";
import {
    Container,
    Grid,
    Typography,
    Button,
    TextField,
    FormLabel,
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
                addAlert("Carga masiva exitosa");
            } else {
                addAlert("Error en la carga masiva");
            }
        })
        .catch((error) => {
            addAlert(error.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };

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
                            3. Subir la plantilla de Excel y el archivo ZIP con la información multimedia.
                        </Typography>
                        <br />
                        <Typography variant="p">
                            4. Hacer clic en el botón "Subir".
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

const LoadingText = styled(Typography)({
    marginTop: "3rem",
    fontSize: "1.2rem",
    textAlign: "center",
});

export default BulkLoading;
