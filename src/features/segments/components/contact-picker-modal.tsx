import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { Search, X } from "lucide-react";
import { ContactDetailsDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";

interface ContactPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContactIds: string[];
  onConfirm: (contactIds: string[]) => void;
}

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  open,
  onOpenChange,
  selectedContactIds,
  onConfirm,
}) => {
  const { client } = useRequestContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedContactIds);
  const [contacts, setContacts] = useState<ContactDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load initial contacts (top 50)
  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [open]);

  // Search contacts when query changes
  useEffect(() => {
    if (open) {
      if (searchQuery.trim()) {
        searchContacts();
      } else {
        loadContacts();
      }
    }
  }, [searchQuery, open]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const result = await client.api.contactsList();
      setContacts(result.data || []);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchContacts = async () => {
    try {
      setSearchLoading(true);
      const result = await client.api.contactsList({ query: searchQuery.trim() });
      setContacts(result.data || []);
    } catch (error) {
      console.error("Failed to search contacts:", error);
      setContacts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleToggleContact = (contactId: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    const allContactIds = contacts.map((c) => String(c.id));
    const allSelected = allContactIds.every((id) => localSelectedIds.includes(id));

    if (allSelected) {
      setLocalSelectedIds((prev) => prev.filter((id) => !allContactIds.includes(id)));
    } else {
      setLocalSelectedIds((prev) => [...new Set([...prev, ...allContactIds])]);
    }
  };

  const handleConfirm = () => {
    onConfirm(localSelectedIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedContactIds);
    onOpenChange(false);
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "?";
  };

  const allContactsSelected =
    contacts.length > 0 &&
    contacts.every((contact) => localSelectedIds.includes(String(contact.id)));

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Select Contacts</Typography>
          <Button variant="text" onClick={handleCancel} sx={{ minWidth: "auto", p: 1 }}>
            <X size={20} />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {searchLoading ? <CircularProgress size={20} /> : <Search size={20} />}
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")} aria-label="Clear">
                    <X size={18} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ mb: 2 }}
          />

          {contacts.length > 0 && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                {localSelectedIds.length} of {contacts.length} contacts selected
              </Typography>
              <Button size="small" onClick={handleSelectAll} variant="outlined">
                {allContactsSelected ? "Deselect All" : "Select All"}
              </Button>
            </Box>
          )}
        </Box>

        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : contacts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                {searchQuery ? "No contacts found matching your search" : "No contacts available"}
              </Typography>
            </Box>
          ) : (
            contacts.map((contact) => (
              <ListItem
                key={contact.id}
                component="div"
                onClick={() => handleToggleContact(String(contact.id))}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                    {contact.avatarUrl ? (
                      <img src={contact.avatarUrl} alt="" />
                    ) : (
                      getInitials(contact.firstName, contact.lastName)
                    )}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={
                        `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Unknown"
                      }
                      secondary={contact.email}
                    />
                    {contact.tags && contact.tags.length > 0 && (
                      <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {contact.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}
                  </Box>

                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      checked={localSelectedIds.includes(String(contact.id))}
                      onChange={() => handleToggleContact(String(contact.id))}
                    />
                  </ListItemSecondaryAction>
                </Box>
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          Select {localSelectedIds.length} Contact{localSelectedIds.length !== 1 ? "s" : ""}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
