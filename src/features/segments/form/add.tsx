import { useNavigate } from "react-router-dom";
import { SegmentCreateDto, SegmentUpdateDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { CoreModule, getCoreModuleRoute } from "lib/router";
import { SegmentForm } from "./segment-form";

export const SegmentAdd = () => {
  const { client } = useRequestContext();
  const navigate = useNavigate();

  const handleSave = async (payload: SegmentCreateDto | SegmentUpdateDto) => {
    await client.api.segmentsCreate(payload as SegmentCreateDto);
  };

  return (
    <SegmentForm
      isEdit={false}
      onSave={handleSave}
      onSaveSuccess={() => navigate(getCoreModuleRoute(CoreModule.segments))}
      onCancel={() => navigate(getCoreModuleRoute(CoreModule.segments))}
    />
  );
};
