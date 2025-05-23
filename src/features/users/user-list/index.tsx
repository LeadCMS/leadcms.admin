import React, { useState } from "react";
import { Avatar, Button, Box, Typography, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Tooltip, IconButton } from "@mui/material";
import { Add, Download, Upload, Edit, Visibility } from "@mui/icons-material";
import { SearchBar } from "@components/search-bar";
import { ModuleWrapper } from "@components/module-wrapper";
import { UserDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import {
  UserGridStorageKey,
  UsersBreadcrumbLinks,
  UsersListCurrentBreadcrumb,
  defaultFilterOrderDirection,
  searchLabel,
} from "../constants";
import { GhostLink } from "@components/ghost-link";
import { buildAbsoluteUrl } from "@lib/network/utils";

function formatDate(date?: string | number | Date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export const UserList = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    UserGridStorageKey,
    undefined
  );
  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [users, setUsers] = useState<UserDetailsDto[]>([]);
  const [sortField, setSortField] = useState<keyof UserDetailsDto>("createdAt");
  const [sortDirection, setSortDirection] = 
    useState<"asc" | "desc">(defaultFilterOrderDirection === "asc" ? "asc" : "desc");
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await client.api.usersList();
      let data = result.data || [];
      // Filter by search
      if (searchTerm) {
        data = data.filter(
          (user) =>
            (user.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      // Sort
      data = [...data].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortField === "createdAt" || sortField === "lastTimeLoggedIn") {
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          const valueA = (aValue || "").toString().toLowerCase();
          const valueB = (bValue || "").toString().toLowerCase();
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
      });
      setUsers(data);
    } catch (error) {
      setUsers([]);
    }
    setLoading(false);
  };

  // Fetch on mount and whenever search/sort changes
  React.useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof UserDetailsDto) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof UserDetailsDto) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <span style={{ marginLeft: 2 }}>▲</span>
    ) : (
      <span style={{ marginLeft: 2 }}>▼</span>
    );
  };

  // Actions
  const handleImport = () => {};
  const handleExport = () => {};
  const handleColumns = () => {};
  const handleFilter = () => {};

  return (
    <ModuleWrapper
      breadcrumbs={UsersBreadcrumbLinks}
      currentBreadcrumb={UsersListCurrentBreadcrumb}
      leftContainerChildren={null}
      extraActionsContainerChildren={null}
      addButtonContainerChildren={null}
    >
      <Box sx={{ maxWidth: "100%", px: { xs: 1, md: 3 }, py: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Search input */}
          <SearchBar
            setSearchTermOnChange={setSearchTerm}
            searchBoxLabel={searchLabel}
            initialValue={searchTerm}
          />
          {/* Action buttons */}
          <Box sx={{ ml: { md: "auto" }, display: "flex", gap: 1 }}>
            <Tooltip title="Filter">
              <Button variant="outlined" size="small" onClick={handleFilter}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <svg width={16} height={16} fill="none" viewBox="0 0 24 24">
                    <path
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 
                      01-.293.707l-6.414 6.414A2 2 0 0013 14.586V19a1 
                      1 0 01-1.447.894l-2-1A1 1 0 009 
                      18v-3.414a2 2 0 00-.293-1.172L2.293 6.707A1 1 0 012 6V4z"
                      stroke="#888"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Button>
            </Tooltip>
            <Tooltip title="Columns">
              <Button variant="outlined" size="small" onClick={handleColumns}>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <svg width={16} height={16} fill="none" viewBox="0 0 24 24">
                    <rect x={3} y={3} width={7} height={7} rx={1} stroke="#888" strokeWidth={2} />
                    <rect x={14} y={3} width={7} height={7} rx={1} stroke="#888" strokeWidth={2} />
                    <rect x={14} y={14} width={7} height={7} rx={1} stroke="#888" strokeWidth={2} />
                    <rect x={3} y={14} width={7} height={7} rx={1} stroke="#888" strokeWidth={2} />
                  </svg>
                </span>
              </Button>
            </Tooltip>
            <Tooltip title="Import">
              <Button variant="outlined" size="small" onClick={handleImport} startIcon={<Upload />}>
                Import
              </Button>
            </Tooltip>
            <Tooltip title="Export">
              <Button variant="outlined" size="small" 
                onClick={handleExport} startIcon={<Download />}>
                Export
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              to="/users/add"
              component={GhostLink}
              startIcon={<Add />}
              sx={{ ml: 1 }}
            >
              Add user
            </Button>
          </Box>
        </Box>
        <Paper
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            background: "#fff",
            boxShadow: 1,
            width: "100%",
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ background: "#f9fafb" }}>
                  <TableCell sx={{ px: 3, py: 2, fontWeight: 700 }}>
                    <Button
                      onClick={() => handleSort("displayName")}
                      sx={{ p: 0, minWidth: 0, fontWeight: 700, color: "#374151" }}
                    >
                      Display {getSortIcon("displayName")}
                    </Button>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2, fontWeight: 700 }}>
                    <Button
                      onClick={() => handleSort("createdAt")}
                      sx={{ p: 0, minWidth: 0, fontWeight: 700, color: "#374151" }}
                    >
                      Created At {getSortIcon("createdAt")}
                    </Button>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2, fontWeight: 700 }}>
                    <Button
                      onClick={() => handleSort("lastTimeLoggedIn")}
                      sx={{ p: 0, minWidth: 0, fontWeight: 700, color: "#374151" }}
                    >
                      Last Active {getSortIcon("lastTimeLoggedIn")}
                    </Button>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2, fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ px: 3, py: 2, fontWeight: 700, textAlign: "right" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        "&:hover": { background: "#f3f4f6" },
                        transition: "background 0.2s",
                      }}
                    >
                      <TableCell sx={{ px: 3, py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={user.avatarUrl ? buildAbsoluteUrl(user.avatarUrl) : undefined}
                            alt={user.displayName || user.email || ""}
                            sx={{ width: 40, height: 40, mr: 2, 
                              bgcolor: "#e5e7eb", fontWeight: 600, fontSize: 18 }}
                          >
                            {(user.displayName || user.email || "U")[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {user.displayName || ""}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2 }}>
                        <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2 }}>
                        <Typography variant="body2">{formatDate(user.lastTimeLoggedIn)}</Typography>
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2, fontFamily: "monospace" }}>
                        {user.id ? String(user.id).substring(0, 8) + "..." : ""}
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2, textAlign: "right" }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              component={GhostLink}
                              to={`/users/${user.id}/edit`}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              color="primary"
                              component={GhostLink}
                              to={`/users/${user.id}/view`}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </ModuleWrapper>
  );
};
