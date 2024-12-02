import { useState } from "react";
import { Modal, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

/**
 * DownloadArtifactButton component renders a button that opens a modal dialog on click.
 * @param {string} text The text displayed on the button.
 * @param {ReactNode} children Optional content to be rendered inside the modal dialog.
 * @returns {JSX.Element} JSX element containing a button and a modal dialog.
 */
const DownloadArtifactButton = ({ text, children }) => {
  const [open, setOpen] = useState(false);// State to manage modal open/close
  
  // Function to open the modal
  const handleOpen = () => setOpen(true);
  
  // Function to close the modal
  const handleClose = () => setOpen(false);

  return (
    <div>
    {/* Button to trigger modal */}
      <Button onClick={handleOpen} variant="contained">
        {text}
      </Button>
       {/* Modal dialog */}
      <CustomModal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div>{children && React.cloneElement(children, { handleClose })}</div>
      </CustomModal>
    </div>
  );
};

// Styled Modal component for custom styling
const CustomModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginTop: '2.5vh',
  marginBottom: '2.5vh',
  paddingTop: '20vh',
  // maxHeight: '95vh',
  overflow: 'auto',
}));

export default DownloadArtifactButton;
