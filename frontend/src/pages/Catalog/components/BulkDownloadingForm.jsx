import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Stack, Paper, InputLabel, Autocomplete } from "@mui/material";
import { API_URLS } from "../../../api";
import { useSnackBars } from "../../../hooks/useSnackbars";
import { useToken } from "../../../hooks/useToken";

/**
 * BulkDownloadArtifactForm  renders a form for downloading multiple artifact data.
 * @param {Array} artifactInfoList List of artifacts being downloaded.
 * @param {Function} handleClose Function to close the modal or form.
 * @returns {JSX.Element} JSX element containing a form for artifact download.
 */
const BulkDownloadArtifactForm  = ({ artifactInfoList, handleClose }) => {
  const { token } = useToken(); // Retrieves authentication token from TokenProvider
  const { addAlert } = useSnackBars(); // Accesses addAlert function from SnackbarProvider
  const [institutions, setInstitutions] = useState([]); // State for storing institutions data
  const [formValues, setFormValues] = useState({ // State for form input values
    fullName: "",
    rut: "",
    email: "",
    institution: { id: "", value: "" },
    comments: "",
  });
  const [rutError, setRutError] = useState(false); // State for RUT validation error
  const [loading, setLoading] = useState(true); // State for loading state
  const [errors, setErrors] = useState(false); // State for general errors
  useEffect(() => {
    console.log("Artifact info en el formulario:", artifactInfoList);
  }, [artifactInfoList]); 

// Fetch institutions data from API on component mount
  useEffect(() => {
    fetch(API_URLS.ALL_INSTITUTIONS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.detail);
          }
          let institutions = Array.from(data.data);
          setInstitutions(institutions);

        }).catch((error) => {
          setErrors(true);
          addAlert(error.message);
        }).finally(() => {
          setLoading(false)
        })})
      }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

// Handle form input changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormValues({
        ...formValues,
        [name]: value,
      });
    };

 // Handle download request
 const handleDownloadRequest = async (formValues) => {
    try {
      const body = {
        fullName: formValues.fullName,
        rut: formValues.rut,
        email: formValues.email,
        institution: formValues.institution.id,
        comments: formValues.comments,
        artifacts: artifactInfoList.map((artifact) => artifact.id), // send all artifact's id
      };
  
      //send the post to backend
      const response = await fetch(`${API_URLS.REQUEST_DOWNLOAD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      // Verifica si la solicitud fue exitosa y muestra una alerta
      if (!response.ok) {
        addAlert(data.detail);
        return;
      }
  
      // success alert
      addAlert("Solicitud enviada exitosamente. Recibirá un correo cuando la descarga esté lista.");
    } catch (error) {
      addAlert("Error al enviar solicitud de descarga");
    }
  };

// Handle form submission
    const handleSubmit = (event) => {
      event.preventDefault();
      // Assuming formValues contains a 'rut' field that needs to be validated
      if (!validateRut(formValues.rut)) {
        setRutError(true);
        return; // Stop the form submission process
      }
      // Reset RUT error if validation passes
      setRutError(false);
      // Proceed with download process
      handleDownloadRequest(formValues);
      handleClose(); // Close the form or modal after submission
    };

    return (
      <Paper>
        <CustomStack>
          <CustomBox
            component="form"
            autoComplete="off"
            onSubmit={handleSubmit}
            onChange={handleChange}
          >
            <CustomTypography variant="h6">
              Para descargar los datos debe llenar este formulario de solicitud
            </CustomTypography>
            <Stack>
              <InputLabel>
                <b>Nombre Completo *</b>
              </InputLabel>
              <TextField
                required
                id="fullName"
                name="fullName"
                margin="normal"
                value={formValues.fullName}
              />
            </Stack>

            <Stack>
              <InputLabel>
                <b>Rut *</b>
              </InputLabel>
              <TextField
                required
                id="rut"
                name="rut"
                margin="normal"
                placeholder="123456789"
                value={formValues.rut}
                error={rutError} // Show error style if there's a RUT error
                helperText={"Sin puntos ni guión"} // Display the RUT error message
              />
            </Stack>

            <Stack>
              <InputLabel>
                <b>Correo Electrónico*</b>
              </InputLabel>
              <TextField
                required
                id="email"
                name="email"
                type="email"
                margin="normal"
                value={formValues.email}
              />
            </Stack>
            <Stack>
              <InputLabel>
                <b>Institución *</b>
              </InputLabel>
              <Autocomplete
                id="institution"
                name="institution"
                value={formValues.institution}
                onChange={(name, value) => {
                  setFormValues({
                    ...formValues,
                    institution: value,
                  });
                }}
                options={institutions}
                noOptionsText="No hay instituciones disponibles"
                getOptionLabel={(option) => option.value ?? ""}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    key={"institution"}
                    {...params}
                    required={true}
                    placeholder={"Seleccione una institución"}
                  />
                )}
                disabled={loading || errors}
              />
            </Stack>
            <Stack>
              <InputLabel>
                <b>Motivo de solicitud (Opcional)</b>
              </InputLabel>
              <TextField
                id="comments"
                name="comments"
                multiline
                margin="normal"
                value={formValues.comments}
              />
            </Stack>
            <OptionBox>
              <CustomButton
                variant="outlined"
                color="primary"
                onClick={handleClose}
              >
                Cancelar
              </CustomButton>

              <CustomButton variant="contained" color="primary" type="submit">
                Enviar
              </CustomButton>
            </OptionBox>
          </CustomBox>
        </CustomStack>
      </Paper>
    );
  };

// Styled components for custom styling
  const CustomStack = styled(Stack)(({ theme }) => ({
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  }));

  const CustomTypography = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
  }));

  const CustomBox = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  }));

  const CustomButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(3.5),
  }));

  const OptionBox = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: theme.spacing(3),
    gap: theme.spacing(2),
  }));

/**
   * validateRut validates the format and checksum of a Chilean RUT.
   * @param {string} rutStr The RUT string to be validated.
   * @returns {boolean} True if the RUT is valid, false otherwise.
   */
  const validateRut = (rutStr) => {
    let rut = rutStr.replace(/\./g, "").replace(/-/g, ""); // Remove dots and dash from RUT to `let` for reassignment
    rut = rut.split(""); // Correct splitting into an array of characters
    if (rut.length !== 9) {
      return false; // Return false if the length is not 9
    }
    const last = rut[8];
    const inverse = rut.slice(0, 8).reverse();
    let total = 0; // Initialize `total` with `let` to allow updates
    for (let i = 0; i < inverse.length; i++) {
      total += parseInt(inverse[i]) * ((i % 6) + 2);
    }
    const rest = 11 - (total % 11);
    if (
      (rest === 10 && (last === "K" || last === "k")) ||
      rest === parseInt(last)
    ) {
      return true; // Assuming the validation logic should return true if conditions are met
    }
    return false; // Return false as default if conditions are not met
  };

  export default BulkDownloadArtifactForm;
