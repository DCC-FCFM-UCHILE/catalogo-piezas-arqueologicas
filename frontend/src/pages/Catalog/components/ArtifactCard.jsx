import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Box,
  Tooltip,
  Checkbox 
} from "@mui/material";
import { Category, Diversity3,CheckCircle } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

/**
 * The ArtifactCard component represents a card displaying summarized information about an artifact.
 * It includes artifact metadata like shape, culture, tags, and description, with optional image preview.
 * @param {object} artifact - The artifact object containing id, attributes, and thumbnail information.
 * @param {boolean} isSelecionMode - this variable tell us if the selectionMode is activate or not. 
 * @param {function} onSelectArtifact - Function to add the artifact to the list of selectedArtifacts
 * @param {boolean} selected // This variable tells us if the artifact is already selected or not, indicating if the checkbox is marked.
 * @returns {JSX.Element} Component for displaying an artifact card.
 */
const ArtifactCard = ({ artifact, isSelectionMode,onSelectArtifact,selected}) => {
  const navigate = useNavigate();
  const { id, attributes, thumbnail: previewPath } = artifact;
  const { shape, tags, culture, description } = attributes;

  // Joining tags into a comma-separated string
  const flattenTags = tags.map((tag) => tag.value).join(", ");

  // Slicing tags to show only the first two followed by a count if more than two tags exist
  const slicedTags = tags
    .slice(0, 2)
    .map((tag) => tag.value)
    .join(", ")
    .concat(`${tags.length > 2 ? `, (+${tags.length - 2})` : ""}`);

  // Handles navigation to detailed artifact view
  const handleRedirect = () => {
    navigate(`/catalog/${id}`);
  };

  return (
    <Card sx={{ position: "relative", border:  "1px solid grey" }}>
      {/* if button is in selection mode */}
      {isSelectionMode &&  ( 
        <Checkbox 
          sx={{ position: "absolute", top: 8, left: 8, color:  "grey" }}
          checked={selected}
          onClick={(e) => {
            e.stopPropagation(); 
            onSelectArtifact(artifact);
          }}
        >
          <CheckCircle />
        </Checkbox >
      )}

      {/* Displaying preview image or default image if previewPath is not available */}
      {previewPath ? (
        <CustomCardMedia
          component="img"
          height="140"
          image={previewPath}
          alt={id}
          onClick={handleRedirect}
          style={{ objectFit: "contain", backgroundColor: "black" }}
        />
      ) : (
        <CustomCardMedia
          component="img"
          height="140"
          image="static/images/not_found_image.png"
          alt={id}
          onClick={handleRedirect}
        />
      )}
      <CustomCardContent>
        {/* Metadata section displaying shape and culture */}
        <MetadataContainer>
          <CustomShapeTag
            label={shape.value}
            size="small"
            icon={<Category color="inherit" fontSize="small" />}
          />
          <CustomCultureTag
            label={culture.value}
            size="small"
            icon={<Diversity3 color="inherit" fontSize="small" />}
          />
        </MetadataContainer>
        {/* Title with artifact ID */}
        <Typography variant="h5" component="div">
          Pieza {id}
        </Typography>
        {/* Tooltip to display tags with ellipsis for long text */}
        <Tooltip arrow title={tags.length > 2 ? flattenTags : ""}>
          <EllipsisBox>
            <Typography
              color="text.secondary"
              overflow={"hidden"}
              textOverflow={"ellipsis"}
            >
              {slicedTags ? `Etiquetas: ${slicedTags}` : "Sin etiquetas"}
            </Typography>
          </EllipsisBox>
        </Tooltip>
        {/* Tooltip to display description with ellipsis for long text */}
        <Tooltip arrow title={description.length > 50 ? description : ""}>
          <EllipsisBox>
            <Typography
              variant="body2"
              overflow={"hidden"}
              textOverflow={"ellipsis"}
            >
              {description}
            </Typography>
          </EllipsisBox>
        </Tooltip>
      </CustomCardContent>
    </Card>
  );
};

// Styled components for customizing UI elements

// Custom styled CardMedia for image preview
const CustomCardMedia = styled(CardMedia)(({ theme }) => ({
  cursor: "pointer",
}));

// Custom styled Box for handling text overflow with ellipsis
const EllipsisBox = styled(Box)(({ theme }) => ({
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

// Custom styled CardContent for flexbox layout and spacing
const CustomCardContent = styled(CardContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  rowGap: 5,
}));

// Custom styled Box for metadata container with flex layout and spacing
const MetadataContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  flexDirection: "row",
  gap: theme.spacing(1),
}));

// Custom styled Chip for shape tag with specific background color and size
const CustomShapeTag = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.tags.shape,
  fontSize: 10,
  height: 24,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  '& .MuiChip-icon': {
    fontSize: 14,
  },
}));

// Custom styled Chip for culture tag with specific background color and size
const CustomCultureTag = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.tags.culture,
  fontSize: 10,
  height: 24,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  '& .MuiChip-icon': {
    fontSize: 14,
  },
}));

export default ArtifactCard;

