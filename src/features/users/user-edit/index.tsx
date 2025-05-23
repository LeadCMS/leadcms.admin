/* eslint-disable max-len */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HttpResponse, ProblemDetails, UserDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { buildAbsoluteUrl } from "@lib/network/utils";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  InputAdornment,
} from "@mui/material";
import { Save, Close, Delete, Visibility, VisibilityOff, CalendarToday, Shield, Key, Person, Email } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function formatDate(date?: string | number | Date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

import { UserEditProps } from "./types";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

export const UserEdit = ({ readonly }: UserEditProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();

  const [user, setUser] = useState<UserDetailsDto | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    role: "viewer",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const resp = await client.api.usersDetail(id);
      setUser(resp.data);
      setFormData({
        displayName: resp.data.displayName || "",
        email: resp.data.email || "",
        role: (resp.data as any).role || "viewer",
        password: "",
        confirmPassword: "",
      });
    })();
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      notificationsService.error("Passwords do not match");
      return;
    }
    try {
      const payload: any = {
        ...user,
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) payload.password = formData.password;
      let response: HttpResponse<UserDetailsDto, void | ProblemDetails>;
      if (id) {
        response = await client.api.usersPartialUpdate(id, payload);
      } else {
        response = await client.api.usersCreate(payload);
      }
      notificationsService.success("User saved");
      navigate("/users");
    } catch (err: any) {
      notificationsService.error("Failed to save user");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await client.api.usersDelete(id);
      notificationsService.success("User deleted");
      setDeleteDialogOpen(false);
      navigate("/users");
    } catch (err: any) {
      notificationsService.error("Failed to delete user");
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", py: 4 }}>
      <form onSubmit={handleSubmit}>
        {/* User Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, alignItems: { md: "center" } }}>
              <Avatar
                src={user.avatarUrl ? buildAbsoluteUrl(user.avatarUrl) : undefined}
                alt={user.displayName || user.email || ""}
                sx={{ width: 80, height: 80, fontSize: 32, bgcolor: "#e5e7eb" }}
              >
                {(user.displayName || user.email || "U")[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700}>
                  {user.displayName}
                </Typography>
                <Typography color="text.secondary">{user.email}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, color: "text.secondary", fontSize: 14 }}>
                  <span>Created: {formatDate(user.createdAt)}</span>
                  <span>•</span>
                  <span>Last active: {formatDate(user.lastTimeLoggedIn)}</span>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignSelf: { xs: "flex-end", md: "center" } }}>
                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => navigate(`/users/${user.id}`)}
                  startIcon={<Visibility />}
                >
                  View
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                  startIcon={<Delete />}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Accordion for user info, password, activity */}
        <Accordion defaultExpanded sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person fontSize="small" />
              <Typography fontWeight={600}>User Information</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Full Name"
                  value={formData.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  placeholder="Enter full name"
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  disabled={readonly}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter email address"
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  disabled={readonly}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="User Role"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Shield fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  disabled={readonly}
                >
                  {roleOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Key fontSize="small" />
              <Typography fontWeight={600}>Change Password</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter new password"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Key fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  disabled={readonly}
                />
                <Typography variant="caption" color="text.secondary">
                  Leave blank to keep the current password
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Key fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  disabled={readonly}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday fontSize="small" />
              <Typography fontWeight={600}>Activity Information</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                  Created At
                </Typography>
                <Typography>{formatDate(user.createdAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                  Last Active
                </Typography>
                <Typography>{formatDate(user.lastTimeLoggedIn)}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                  User ID
                </Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: 14 }}>{user.id}</Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            type="button"
            onClick={() => navigate("/users")}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          {!readonly && (
            <Button type="submit" variant="contained" startIcon={<Save />}>
              Save Changes
            </Button>
          )}
        </Box>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {user.displayName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
