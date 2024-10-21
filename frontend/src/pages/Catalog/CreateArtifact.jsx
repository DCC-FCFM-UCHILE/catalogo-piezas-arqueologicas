import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  FormLabel,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import UploadButton from "../sharedComponents/UploadButton";
import AutocompleteExtended from "../sharedComponents/AutocompleteExtended";
import { API_URLS } from "../../api";
import { useSnackBars } from "../../hooks/useSnackbars";
import { useToken } from "../../hooks/useToken";

export const allowedFileTypes = {
  object: ["obj"],
  texture: ["jpg"],
  material: ["mtl"],
  thumbnail: ["jpg", "png"],
  images: ["jpg", "png"],
  excel: ["xlsx"],
  zip: ["zip"],
};

const CreateArtifact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAlert } = useSnackBars();
  const { token } = useToken();

  const [newObjectAttributes, setNewObjectAttributes] = useState({
    object: {},
    texture: {},
    material: {},
    thumbnail: {},
    images: [],
    description: "",
    shape: {
      id: "",
      value: "",
    },
    culture: {
      id: "",
      value: "",
    },
    tags: [],
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(false);
  const goBack = !!location.state?.from;

  // Retrieved data from the API
  const [shapeOptions, setShapeOptions] = useState([]);
  const [cultureOptions, setCultureOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  // Fetch data from the API
  useEffect(() => {
    fetch(API_URLS.ALL_METADATA, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) =>
      response
        .json()
        .then((data) => {
          if (!response.ok) {
            throw new Error(data.detail);
          }
          let metadata = data.data;
          let shapes = metadata.shapes;
          let cultures = metadata.cultures;
          let tags = metadata.tags;

          setShapeOptions(shapes);
          setCultureOptions(cultures);
          setTagOptions(tags);
        })
        .catch((error) => {
          setErrors(true);
          addAlert(error.message);
        })
        .finally(() => setLoading(false))
    );
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (name, value) => {
    setNewObjectAttributes({ ...newObjectAttributes, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append(`model[new_object]`, newObjectAttributes.object);
    formData.append(`model[new_texture]`, newObjectAttributes.texture);
    formData.append(`model[new_material]`, newObjectAttributes.material);
    formData.append(`new_thumbnail`, newObjectAttributes.thumbnail);
    newObjectAttributes.images.forEach((image) =>
      formData.append("new_images", image)
    );
    formData.append("description", newObjectAttributes.description);
    formData.append("id_shape", newObjectAttributes.shape.id);
    formData.append("id_culture", newObjectAttributes.culture.id);
    newObjectAttributes.tags.forEach((tag) =>
      formData.append("id_tags", tag.id)
    );

    await fetch(`${API_URLS.DETAILED_ARTIFACT}/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      response
        .json()
        .then((data) => {
          if (!response.ok) {
            throw new Error(data.detail);
          }
          const successfully_response = data.data;
          const newArtifactId = successfully_response.id;
          addAlert("¡Objeto creado con éxito!");
          navigate(`/catalog/${newArtifactId}`);
        })
        .catch((error) => {
          addAlert(error.message);
        });
    });
  };

  const handleCancel = () => {
    const from = goBack ? location.state.from : "/catalog";
    navigate(from, { replace: goBack });
  };

  return (
    <Container>
      <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
        <Grid container rowGap={4}>
          <CustomTypography variant="h1">Agregar nueva pieza</CustomTypography>
          <Grid container spacing={2}>
            <ColumnGrid item xs={6} rowGap={2}>
              <UploadButton
                label="Objeto *"
                name="object"
                isRequired
                setStateFn={setNewObjectAttributes}
              />
              <UploadButton
                label="Textura *"
                name="texture"
                isRequired
                setStateFn={setNewObjectAttributes}
              />
              <UploadButton
                label="Material *"
                name="material"
                isRequired
                setStateFn={setNewObjectAttributes}
              />
              <UploadButton
                label="Miniatura (opcional)"
                name="thumbnail"
                setStateFn={setNewObjectAttributes}
              />
              <UploadButton
                label="Imágenes (opcional)"
                name="images"
                isMultiple
                setStateFn={setNewObjectAttributes}
              />
            </ColumnGrid>
            <ColumnGrid item xs={6} rowGap={1}>
              <FormLabel component="legend">Descripción *</FormLabel>
              <TextField
                required
                id="description"
                name="description"
                placeholder="Descripción del objeto"
                multiline
                rows={4}
                fullWidth
                value={newObjectAttributes.description}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
              />
              <FormLabel component="legend">Forma *</FormLabel>
              <AutocompleteExtended
                id="shape"
                name="shape"
                value={newObjectAttributes.shape}
                setValue={handleInputChange}
                options={shapeOptions}
                placeholder="Seleccionar la forma del objeto"
                isRequired
                fullWidth
                filterSelectedOptions
                disabled={loading || errors}
                allowCreation={false}
              />
              <FormLabel component="legend">Cultura *</FormLabel>
              <AutocompleteExtended
                id="culture"
                name="culture"
                value={newObjectAttributes.culture}
                setValue={handleInputChange}
                options={cultureOptions}
                placeholder="Seleccionar la cultura del objeto"
                isRequired
                fullWidth
                filterSelectedOptions
                disabled={loading || errors}
                allowCreation={false}
              />
              <FormLabel component="legend">Etiquetas (opcional)</FormLabel>
              <AutocompleteExtended
                multiple
                limitTags={3}
                fullWidth
                id="tags"
                name="tags"
                value={newObjectAttributes.tags}
                setValue={handleInputChange}
                options={tagOptions}
                placeholder="Seleccionar las etiquetas del objeto"
                filterSelectedOptions
                disabled={loading || errors}
                allowCreation={false}
              />
            </ColumnGrid>
          </Grid>
          <Grid container justifyContent="flex-end" columnGap={2}>
            <Button variant="text" color="secondary" onClick={handleCancel}>
              {goBack ? "Cancelar" : "Volver al catálogo"}
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Publicar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

const CustomTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(6),
  textAlign: "left",
}));

const ColumnGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

export default CreateArtifact;
