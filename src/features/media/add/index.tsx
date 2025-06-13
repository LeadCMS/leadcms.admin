import { useRequestContext } from "@providers/request-provider";
import MediaForm from "../form";

const MediaAdd = () => {
  const { client } = useRequestContext();

  const handleSave = async ({ Image, ScopeUid }: { Image: File; ScopeUid: string }) => {
    await client.api.mediaCreate({ Image, ScopeUid });
  };

  return <MediaForm isEdit={false} handleSave={handleSave} />;
};

export default MediaAdd;
