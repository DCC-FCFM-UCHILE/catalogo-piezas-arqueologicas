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
    repeatEmail: "",
    institution: { id: "", value: "" },
    comments: "",
  });
  const [rutError, setRutError] = useState(false); // State for RUT validation error
  const [loading, setLoading] = useState(true); // State for loading state
  const [errors, setErrors] = useState(false); // State for general errors
  const [emailMatchError, setEmailMatchError] = useState(false);  // Error state for email mismatch
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

       // Check if emails match on every change to email fields
       if (name === "email" || name === "repeatEmail") {
        checkEmailsMatch(value, name);
      }
    };
    
// Function to check if email and repeatEmail match
const checkEmailsMatch = (value, fieldName) => {
  const email = fieldName === "email" ? value : formValues.email;
  const repeatEmail = fieldName === "repeatEmail" ? value : formValues.repeatEmail;
  setEmailMatchError(email !== repeatEmail);  // Update error state if emails don't match
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
        authenticated:false
      };
  
      //send the post to backend
      const response = await fetch(`${API_URLS.DETAILED_ARTIFACT}/bulkdownloading`, {
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
      console.log('tratando de enviar formuilario')
      // Assuming formValues contains a 'rut' field that needs to be validated

      if (emailMatchError) {
        addAlert("Los correos electrónicos no coinciden.");
        return;
      }
      
      if (!validateRut(formValues.rut)) {
        setRutError(true);
        console.log('malo el rut')
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
            sx={{
              maxWidth: '100%',  
            }}
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
                helperText={rutError ? "RUT inválido" : "Sin puntos ni guión"} // Display the RUT error message
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
                <b>Repetir Correo Electrónico *</b>
              </InputLabel>
              <TextField
                required
                id="repeatEmail"
                name="repeatEmail"
                type="email"
                margin="normal"
                value={formValues.repeatEmail}
                error={emailMatchError}  // Show error if emails don't match
                helperText={emailMatchError ? "Los correos electrónicos no coinciden" : ""}
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
  // Normalize the RUT: remove dots and dashes, and convert to uppercase
  const normalizedRut = rutStr.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  // Ensure the RUT has at least 2 characters (body + DV)
  if (normalizedRut.length < 2) {
    return false;
  }

  // Separate the body and the verification digit (DV)
  const rutBody = normalizedRut.slice(0, -1); // All except the last character
  const rutDv = normalizedRut.slice(-1); // Last character

  // Ensure the body is numeric
  if (!/^\d+$/.test(rutBody)) {
    return false;
  }

  // Calculate the verification digit
  let total = 0;
  let factor = 2;

  // Loop through the body digits from right to left
  for (let i = rutBody.length - 1; i >= 0; i--) {
    total += parseInt(rutBody[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const rest = total % 11;
  const calculatedDv = 11 - rest;

  // Map calculated DV to its string representation
  const validDv = calculatedDv === 10 ? "K" : calculatedDv === 11 ? "0" : calculatedDv.toString();

  // Return whether the entered DV matches the calculated one
  return validDv === rutDv;
};
  export default BulkDownloadArtifactForm;
