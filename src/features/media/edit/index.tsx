import React, { useEffect, useState } from "react";
import { MediaDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import MediaForm from "../form";
import { useRouteParams } from "typesafe-routes";
import { editFormRoute } from "@lib/router";

const MediaEdit = () => {
  const { client } = useRequestContext();
  const { id } = useRouteParams(editFormRoute);
  const [media, setMedia] = useState<MediaDetailsDto>();

  useEffect(() => {
    (async () => {
      try {
        const result = await client.api.mediaDetail(String(id));
        // Patch: forcibly cast result to MediaDetailsDto
        if (result && typeof result === "object") {
          setMedia(result as MediaDetailsDto);
        } else {
          setMedia(undefined);
        }
      } catch (e) {
        console.log(e);
        setMedia(undefined);
      }
    })();
  }, [client, id]);

  const handleSave = async ({ Image }: { Image: File }) => {
    if (!media?.scopeUid) return;
    await client.api.mediaCreate({ Image, ScopeUid: media.scopeUid });
  };

  return media
    ? (
        <MediaForm
          isEdit={true}
          handleSave={handleSave}
          scopeUid={media.scopeUid}
        />
      )
    : null;
};

export default MediaEdit;
