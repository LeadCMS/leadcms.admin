import { DateValueFormatter, DateValueGetter } from "@components/data-list";
import { ActionButtonContainer } from "@features/contacts/index.styled";
import { useNotificationsService } from "@hooks";
import { ActivityLogDetailsDto } from "@lib/network/swagger-client";
import { Card, CardContent, Grid, IconButton, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { getWhereFilterQuery } from "@providers/query-provider";
import { useRequestContext } from "@providers/request-provider";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLocation, useNavigate } from "react-router-dom";
import { contactLogsRoute, getViewFormRoute, viewFormRoute } from "@lib/router";
import { useEffect, useState } from "react";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useRouteParams } from "typesafe-routes";

export const ContactLogs = () => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const navigate = useNavigate();
  const { setBusy } = useModuleWrapperContext();

  const { id } = useRouteParams(viewFormRoute);

  const [logs, setLogs] = useState<ActivityLogDetailsDto[]>();

  useEffect(() => {
    setBusy(async () => {
      try {
        setLogs(await getContactLogs(id));
      } catch (e) {
        console.log(e);
      }
    });
  }, [client]);

  const getContactLogs = async (contactId: number) => {
    try {
      const { data } = await client.api.activityLogList({
        query: getWhereFilterQuery("contactId", contactId.toString(), "equals"),
      });
      if (data.length > 0) {
        return data;
      } else {
        notificationsService.info("No logs available for selected contact.");
        return [];
      }
    } catch (error) {
      console.log(error);
      notificationsService.error("Server error: could not retrieve logs.");
    }
  };

  const handleForwardClick = (row: any) => {
    navigate(`/logs/${getViewFormRoute(row.id!)}`, { state: row });
  };

  const columns: GridColDef<ActivityLogDetailsDto>[] = [
    {
      field: "type",
      headerName: "Type",
      flex: 2,
    },
    {
      field: "source",
      headerName: "Source",
      flex: 2,
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 2,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "data",
      headerName: "Data",
      flex: 2,      
      hide: true,
    },
    {
      field: "ip",
      headerName: "Ip",
      flex: 2,
    },
  ];

  const actionsColumn: GridColDef | any = {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    align: "right",
    headerAlign: "center",
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: ({ row }: any) => {
      return (
        <ActionButtonContainer>
          <IconButton disabled onClick={() => handleForwardClick(row)}>
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </ActionButtonContainer>
      );
    },
  };

  const gridFinalizedColumns = columns.concat(actionsColumn);

  return (
    <Grid container spacing={3} marginTop={4} paddingRight={4}>
      <Grid xs={12} sm={12} item>
        <Card>
          <CardContent>
            <Grid marginBottom={4}>
              <Typography gutterBottom variant="h6" component="div">
                {"Logs"}
              </Typography>
            </Grid>
            <Grid>
              <DataGrid
                columns={gridFinalizedColumns}
                rows={logs || []}
                loading={!logs}
                checkboxSelection={false}
                autoHeight={true}
                pagination={undefined}
                hideFooter={true}
              />
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
