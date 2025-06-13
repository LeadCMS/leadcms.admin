import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import { Box, Button, Grid, TextField } from "@mui/material";
import { ModuleWrapper } from "@components/module-wrapper";
import { mediaFormBreadcrumbLinks, mediaAddHeader, mediaEditHeader } from "../constants";

interface MediaFormProps {
  isEdit: boolean;
  handleSave: (data: { Image: File; ScopeUid: string }) => Promise<void>;
  scopeUid?: string;
}

const MediaForm = ({ isEdit, handleSave, scopeUid }: MediaFormProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: {
      file: undefined as File | undefined,
      scopeUid: scopeUid || "",
    },
    onSubmit: async (values) => {
      if (!values.file || (!isEdit && !values.scopeUid)) return;
      await handleSave({ Image: values.file, ScopeUid: values.scopeUid });
    },
    enableReinitialize: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue("file", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const header = isEdit ? mediaEditHeader : mediaAddHeader;

  return (
    <ModuleWrapper
      breadcrumbs={mediaFormBreadcrumbLinks}
      currentBreadcrumb={header}
      saveIndicatorElement={null}
      actionButtons={null}
    >
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2} marginTop={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2 }}
            >
              {formik.values.file ? "Change File" : "Select File"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {previewUrl && (
              <Box mt={2}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: 320,
                    maxHeight: 320,
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                  onError={e => {
                    const target = e.currentTarget;
                    if (target.src !== "/images/placeholder.svg") {
                      target.src = "/images/placeholder.svg";
                    }
                  }}
                />
              </Box>
            )}
          </Grid>
          {!isEdit && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Scope UID"
                name="scopeUid"
                value={formik.values.scopeUid}
                onChange={formik.handleChange}
                required
              />
            </Grid>
          )}
        </Grid>
        <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={formik.isSubmitting || !formik.values.file || 
                (!isEdit && !formik.values.scopeUid)}
          >
            {isEdit ? "Save Changes" : "Add Media"}
          </Button>
        </Box>
      </form>
    </ModuleWrapper>
  );
};

export default MediaForm;
