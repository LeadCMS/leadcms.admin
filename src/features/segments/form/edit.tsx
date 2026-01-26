import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate, useParams } from "react-router-dom";
import { ModuleWrapper } from "@components/module-wrapper";
import { SegmentsBreadcrumbLinks } from "../constants";
import { SegmentCreateDto, SegmentDetailsDto, SegmentUpdateDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { useNotificationsService } from "@hooks";
import { CoreModule, getCoreModuleRoute, getViewFormRoute, type IdRouteParams } from "lib/router";
import { SegmentForm } from "./segment-form";

export const SegmentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<IdRouteParams>();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();

  const [segment, setSegment] = useState<SegmentDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSegment = async () => {
      if (!id) return;

      try {
        const result = await client.api.segmentsDetail(Number(id));
        setSegment(result.data);
      } catch (error) {
        console.error("Failed to load segment:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSegment();
  }, [id, client]);

  if (loading) {
    return (
      <ModuleWrapper breadcrumbs={SegmentsBreadcrumbLinks} currentBreadcrumb="Edit Segment">
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </ModuleWrapper>
    );
  }

  if (!segment) {
    return (
      <ModuleWrapper breadcrumbs={SegmentsBreadcrumbLinks} currentBreadcrumb="Edit Segment">
        <Alert severity="error">Segment not found</Alert>
      </ModuleWrapper>
    );
  }

  const handleSave = async (payload: SegmentCreateDto | SegmentUpdateDto) => {
    await client.api.segmentsPartialUpdate(segment.id!, payload as SegmentUpdateDto);
  };

  const handleDelete = async () => {
    await client.api.segmentsDelete(segment.id!);
    notificationsService.success("Segment deleted.");
    navigate(getCoreModuleRoute(CoreModule.segments));
  };

  const viewRoute = getCoreModuleRoute(CoreModule.segments) + "/" + getViewFormRoute(Number(id));

  return (
    <SegmentForm
      segment={segment}
      isEdit={true}
      onSave={handleSave}
      onSaveSuccess={() => navigate(viewRoute)}
      onCancel={() => navigate(viewRoute)}
      onDelete={handleDelete}
    />
  );
};
