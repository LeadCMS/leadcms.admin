import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { EmailGroupDetailsDto, EmailTemplateDetailsDto } from "@lib/network/swagger-client";
import { getAddFormRoute } from "@lib/router";
import { Plus, Download, Filter, Settings2, Sparkles } from "lucide-react";
import Button from "@mui/material/Button";
import { Box, Chip, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useRequestContext } from "@providers/request-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { getWhereFilterQuery } from "@providers/query-provider";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@providers/config-provider";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  emailTemplateGridSettingsStorageKey,
  emailTemplateGroupFilterStorageKey,
  emailTemplateListPageBreadcrumb,
  searchLabel,
} from "../constants";
import { dataListBreadcrumbLinks } from "utils/constants";
import { ToolbarButton } from "@components/tool-bar-button";

export const EmailTemplatesList = () => {
  const { client } = useRequestContext();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const navigate = useNavigate();
  const { config } = useConfig();
  const [gridSettings] = useLocalStorage<DataListSettings | undefined>(
    emailTemplateGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openExport, setOpenExport] = useState(false);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useLocalStorage<number | "">(
    emailTemplateGroupFilterStorageKey,
    ""
  );
  const [allEmailGroups, setAllEmailGroups] = useState<EmailGroupDetailsDto[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dataExportQuery = useRef("");

  useEffect(() => {
    client.api
      .emailGroupsList()
      .then((res) => setAllEmailGroups(res.data))
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }, [client]);

  // Filter groups by active language (match on prefix, e.g. "en" matches "en-US")
  const emailGroups =
    isLanguageFilterActive && selectedLanguage !== "all"
      ? allEmailGroups.filter((g) => {
          const langPrefix = selectedLanguage.split("-")[0].toLowerCase();
          return (
            g.language?.toLowerCase() === selectedLanguage.toLowerCase() ||
            g.language?.toLowerCase().startsWith(langPrefix)
          );
        })
      : allEmailGroups;

  // Clear stored selection when the selected group no longer belongs to the visible list
  useEffect(() => {
    if (
      selectedGroupId !== "" &&
      allEmailGroups.length > 0 &&
      !emailGroups.some((g) => g.id === selectedGroupId)
    ) {
      setSelectedGroupId("");
    }
  }, [emailGroups]);

  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [selectedGroupId, selectedLanguage]);

  const getEmailTemplatesList = async (mainQuery: string, exportQuery?: string) => {
    dataExportQuery.current = exportQuery || "";
    const includeFilter = "filter[include]=EmailGroup";
    let groupFilter = "";
    if (selectedGroupId !== "") {
      groupFilter = `filter[where][emailGroupId]=${selectedGroupId}`;
    }
    let languageFilter = "";
    if (isLanguageFilterActive && selectedLanguage !== "all") {
      const langCode = selectedLanguage.split("-")[0];
      languageFilter = getWhereFilterQuery("language", langCode, "contains").replace(/^&/, "");
    }
    const fullQuery = [mainQuery, includeFilter, groupFilter, languageFilter]
      .filter(Boolean)
      .join("&");
    const result = await client.api.emailTemplatesList({ query: fullQuery });
    return result;
  };

  const emailTemplatesExportApi: (query: string, accept: string) => Promise<Response> = (
    query,
    accept
  ) => client.api.emailTemplatesExportList({ query }, { headers: { Accept: accept } });

  const handleExportOpen = () => {
    openExport ? setOpenExport(false) : setOpenExport(true);
  };

  const [columns, setColumns] = useState<GridColDef<EmailTemplateDetailsDto>[]>([
    {
      field: "id",
      headerName: "id",
      width: 100,
    },
    {
      field: "name",
      headerName: "Name",
      width: 140,
      type: "string",
    },
    {
      field: "subject",
      headerName: "Subject",
      width: 120,
      type: "string",
    },
    {
      field: "fromEmail",
      headerName: "Sender Email",
      width: 120,
      type: "string",
    },
    {
      field: "fromName",
      headerName: "Sender Name",
      width: 140,
      type: "string",
    },
    {
      field: "emailGroup.name",
      headerName: "Group",
      width: 160,
      type: "string",
      sortable: true,
      valueGetter: (_value: unknown, row: EmailTemplateDetailsDto) => row.emailGroup?.name || "",
    },
    {
      field: "language",
      headerName: "Language",
      width: 120,
      type: "string",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 120,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 120,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
  ]);

  const searchBar = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <SearchBar
        setSearchTermOnChange={setSearchTerm}
        searchBoxLabel={searchLabel}
        initialValue={gridSettings?.searchTerm ?? ""}
      />
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="email-group-filter-label">Group</InputLabel>
        <Select
          labelId="email-group-filter-label"
          label="Group"
          value={emailGroups.some((g) => g.id === selectedGroupId) ? selectedGroupId : ""}
          onChange={(e) => setSelectedGroupId(e.target.value as number | "")}
        >
          <MenuItem value="">All groups</MenuItem>
          {emailGroups.map((g) => (
            <MenuItem key={g.id} value={g.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {g.name}
                {g.language && (
                  <Chip
                    label={g.language}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.65rem", "& .MuiChip-label": { px: 0.75 } }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  const extraActions = [
    <ToolbarButton
      key="filter-btn"
      startIcon={<Filter size={18} />}
      onClick={() => setFilterPanelOpen(true)}
      sx={{
        minWidth: 0,
        py: 2,
        px: 2,
        ".MuiButton-startIcon": { marginRight: 0, marginLeft: 0 },
      }}
    ></ToolbarButton>,
    <ToolbarButton
      key="columns-btn"
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen((open) => !open)}
    >
      Columns
    </ToolbarButton>,
    <ToolbarButton key={"export-btn"} startIcon={<Download size={18} />} onClick={handleExportOpen}>
      Export
    </ToolbarButton>,
  ];

  const addButton = (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button
        variant="contained"
        to={getAddFormRoute()}
        component={GhostLink}
        startIcon={<Plus size={18} />}
      >
        Add template
      </Button>
      {config?.capabilities?.includes("AIAssistance") && (
        <Button
          variant="outlined"
          onClick={() => navigate("/email-templates/ai-draft")}
          startIcon={<Sparkles size={18} />}
        >
          Create with AI
        </Button>
      )}
    </Box>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={emailTemplateListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={emailTemplateGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getEmailTemplatesList}
        refreshFlag={refreshTrigger}
        initialGridState={{
          columns: { columnVisibilityModel: {} },
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
        onExportOpen={openExport}
        onExportClose={handleExportOpen}
        exportApiCall={emailTemplatesExportApi}
      ></DataList>
    </ModuleWrapper>
  );
};
