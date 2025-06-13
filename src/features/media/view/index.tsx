import React, { useEffect, useState } from "react";
import { MediaDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useRouteParams } from "typesafe-routes";
import { viewFormRoute, CoreModule } from "@lib/router";
import { DataView } from "@components/data-view";
import { Grid, Box, Typography } from "@mui/material";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { DataManagementBlock } from "@components/data-management";

const MediaView = () => {
  const context = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const { client } = context;
  const { id } = useRouteParams(viewFormRoute);
  const [media, setMedia] = useState<MediaDetailsDto>();

  useEffect(() => {
    setBusy(async () => {
      try {
        const result = await client.api.mediaDetail(String(id));
        if (result && typeof result === "object") {
          setMedia(result as MediaDetailsDto);
        } else {
          setMedia(undefined);
        }
      } catch (e) {
        console.log(e);
        setMedia(undefined);
      }
    });
  }, [client, id]);

  if (!media) return null;

  const mediaData = [
    { label: "Name", value: media.name || "" },
    { label: "Location", value: media.location || "" },
    { label: "Extension", value: media.extension || "" },
    { label: "Mime Type", value: media.mimeType || "" },
    { label: "Size", value: media.size || "" },
    { label: "Scope UID", value: media.scopeUid || "" },
    { label: "Created At", value: media.createdAt || "" },
    { label: "Updated At", value: media.updatedAt || "" },
  ];

  return (
    <Grid container spacing={3} marginTop={4} paddingRight={4}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Box mb={2}>
          <Typography variant="h6">Preview</Typography>
          <img
            src={media.location}
            alt={media.name}
            style={{ maxWidth: 480, maxHeight: 480, borderRadius: 8, border: "1px solid #eee" }}
            onError={e => {
              const target = e.currentTarget;
              if (target.src !== "/images/placeholder.svg") {
                target.src = "/images/placeholder.svg";
              }
            }}
          />
        </Box>
        <DataView header="Media Details" rows={mediaData} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DataManagementBlock
          header="Data Management"
          description="Please be aware that what has been deleted can never be brought back."
          entity="media"
          handleDeleteAsync={(id) => client.api.mediaDelete(id as string)}
          itemId={id}
          successNavigationRoute={CoreModule.media}
        />
      </Grid>
    </Grid>
  );
};

export default MediaView;
