import styled from "@emotion/styled";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";

export const FileNameTextSpan = styled("span")({
  marginRight: "5px",
});

export const DataGridDiv = styled("div")({
  height: 400,
  width: "100%",
});

export const UploadButton = styled(Button)({
  marginLeft: "10px",
});

export const StyledBackdrop = styled(Backdrop)({
  zIndex: 999,
});
