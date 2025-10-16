import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  SelectChangeEvent,
  Grid,
  Divider,
  Stack,
} from "@mui/material";
import {
  MessageSquare,
  MessageCircle,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Reply,
} from "lucide-react";
import { useRequestContext } from "@providers/request-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { useUserInfo } from "@providers/user-provider";
import { useConfig } from "@providers/config-provider";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { ToolbarButton } from "@components/tool-bar-button";
import { useNotificationsService } from "@hooks";
import { CommentDetailsDto } from "@lib/network/swagger-client";
import { dataListBreadcrumbLinks } from "@utils/constants";
import { Download, Filter, SortAsc, SortDesc } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { CustomFilterBar } from "@components/custom-filter";
import { CommentSortPopup } from "@components/comment-sort-popup";
import { GridColDef } from "@mui/x-data-grid";
import { getWhereFilterQuery } from "@providers/query-provider";
import NoRecordsDisplay from "@components/no-records-display";
import useLocalStorage from "use-local-storage";

// Enhanced comment interface extending the existing type
interface EnhancedCommentDto extends CommentDetailsDto {
  contentTitle?: string;
  contentType?: string;
  contentUrl?: string;
}

type TabValue = "All" | "NotApproved" | "Approved" | "Spam" | "Answer" | "Unanswered";

type CommentListFilterSettings = {
  whereFilters: Array<{ whereField: string; whereOperator: string; whereFieldValue: string }>;
  sortField: string;
  sortDirection: "asc" | "desc";
  searchTerm?: string;
  activeTab?: TabValue;
};

const COMMENT_FILTERS_KEY = "comment-list-filters";

export const CommentsList: React.FC = () => {
  const { client } = useRequestContext();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const { notificationsService } = useNotificationsService();
  const userInfo = useUserInfo();
  const { config } = useConfig();

  // Filter settings with localStorage
  const [storedSettings, setStoredSettings] = useLocalStorage<CommentListFilterSettings>(
    COMMENT_FILTERS_KEY,
    {
      whereFilters: [],
      sortField: "createdAt",
      sortDirection: "desc",
      searchTerm: "",
      activeTab: "All",
    }
  );

  // State
  const [comments, setComments] = useState<EnhancedCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(storedSettings?.searchTerm ?? "");
  const [activeTab, setActiveTab] = useState<TabValue>(storedSettings?.activeTab ?? "All");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Filter state
  const [whereFilters, setWhereFilters] = useState(storedSettings.whereFilters);
  const [sortField, setSortField] = useState(storedSettings.sortField);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(storedSettings.sortDirection);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);

  // Dialog state
  const [dialogMode, setDialogMode] = useState<"edit" | "reply" | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<EnhancedCommentDto | null>(null);

  // Unified comment dialog state
  const [commentBody, setCommentBody] = useState("");
  const [commentAuthorName, setCommentAuthorName] = useState("");
  const [commentAuthorEmail, setCommentAuthorEmail] = useState("");
  const [commentStatus, setCommentStatus] = useState<
    "NotApproved" | "Approved" | "Spam" | "Answer"
  >("Approved");
  const [commentAnswerStatus, setCommentAnswerStatus] = useState<
    "Unanswered" | "Answered" | "Closed" | null
  >(null);
  const [commentLanguage, setCommentLanguage] = useState("");

  // Filtering and pagination
  const [totalCount, setTotalCount] = useState(0);
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);

  // Statistics from API
  const [statistics, setStatistics] = useState<Record<string, number>>({});

  // Bulk actions state
  const [selectedBulkAction, setSelectedBulkAction] = useState("");

  // Loading states for async operations
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState<{
    commentId: number;
    action: string;
  } | null>(null);
  const [answerStatusChangeLoading, setAnswerStatusChangeLoading] = useState<{
    commentId: number;
    action: string;
  } | null>(null);

  // Filter columns definition
  const commentFilterColumns: GridColDef[] = [
    { field: "body", headerName: "Body" },
    { field: "authorEmail", headerName: "Author Email" },
    { field: "authorName", headerName: "Author Name" },
    { field: "createdAt", headerName: "Created At" },
    { field: "updatedAt", headerName: "Updated At" },
  ];

  // Filter helper functions
  const addFilter = (
    filter: { whereField?: string; whereOperator?: string; whereFieldValue?: string },
    _removeIdx?: number,
    editIdx?: number
  ) => {
    setWhereFilters((old) => {
      if (typeof editIdx === "number" && editIdx >= 0) {
        const copy = [...old];
        copy[editIdx] = filter as {
          whereField: string;
          whereOperator: string;
          whereFieldValue: string;
        };
        return copy;
      }
      return [
        ...old,
        filter as { whereField: string; whereOperator: string; whereFieldValue: string },
      ];
    });
  };

  const removeFilter = (idx: number) => {
    setWhereFilters((old) => old.filter((_, i) => i !== idx));
  };

  const clearAllFilters = () => {
    setWhereFilters([]);
    setSearchQuery("");
    setActiveTab("All");
  };

  const buildWhereQuery = () => {
    const queries = whereFilters
      .map((f) => {
        const query = getWhereFilterQuery(
          f.whereField || "",
          f.whereFieldValue || "",
          f.whereOperator || ""
        );
        return query;
      })
      .filter(Boolean);
    return queries.join("");
  };

  // Save filter settings to localStorage
  useEffect(() => {
    setStoredSettings({
      whereFilters,
      sortField,
      sortDirection,
      searchTerm: searchQuery,
      activeTab,
    });
  }, [whereFilters, sortField, sortDirection, searchQuery, activeTab, setStoredSettings]);

  // Load comments with pagination - matching content list pattern
  const loadComments = async () => {
    setLoading(true);
    const filter: Record<string, unknown> = {
      ["filter[order]"]: `${sortField} ${sortDirection === "asc" ? "" : "desc"}`.trim(),
      ["filter[skip]"]: !initialLoadRef.current ? 0 : comments.length,
      ["filter[limit]"]: 20,
    };

    if (searchQuery?.trim()) {
      filter.query = searchQuery;
    }

    // Build where query from custom filters
    const whereQuery = buildWhereQuery();

    // Add global language filter if active
    let globalLanguageQuery = "";
    if (isLanguageFilterActive && selectedLanguage !== "all") {
      globalLanguageQuery = getWhereFilterQuery("language", selectedLanguage, "equals");
    }

    // Combine all queries
    const combinedQuery = [whereQuery, globalLanguageQuery].filter(Boolean).join("");
    if (combinedQuery) {
      filter.query = (filter.query || "") + combinedQuery;
    }

    // Add tab filter
    if (activeTab !== "All" && activeTab !== "Unanswered") {
      // Add status filtering based on active tab using API status names
      filter["filter[where][status]"] = activeTab;
    } else if (activeTab === "Unanswered") {
      // Filter by answerStatus for Unanswered tab
      filter["filter[where][answerStatus]"] = "Unanswered";
    }

    try {
      const { data, headers } = await client.api.commentsWithStatisticsList(filter);

      // Extract comments and statistics from response
      const commentsData = data?.comments || [];
      const statisticsData = data?.statistics || {};

      // Transform comments to enhanced format
      const enhancedComments: EnhancedCommentDto[] = commentsData.map((comment) => ({
        ...comment,
        contentTitle: `${comment.commentableType} #${comment.commentableId}`,
        contentType: comment.commentableType || "unknown",
        contentUrl: comment.commentableId ? `/content/${comment.commentableId}/edit` : "#",
        avatarUrl: comment.avatarUrl || generateAvatarUrl(comment.authorEmail),
      }));

      // Deduplicate by id - exactly like content list
      setComments((prev) => {
        const map = new Map<number, EnhancedCommentDto>();
        prev.forEach((item) => {
          if (item.id != null) map.set(item.id, item);
        });
        enhancedComments.forEach((item) => {
          if (item.id != null) map.set(item.id, item);
        });
        return Array.from(map.values());
      });

      // Store statistics from API
      setStatistics(statisticsData);

      // Handle total count from headers (for "All" tab)
      let newTotalCount = totalCount;
      if (headers && typeof headers.get === "function") {
        const count = headers.get("x-total-count");
        if (count) newTotalCount = parseInt(count, 10);
      }
      setTotalCount(newTotalCount);
    } catch (error) {
      notificationsService.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  // Generate avatar URL (fallback)
  const generateAvatarUrl = (email?: string | null) => {
    if (!email) return undefined;
    // You could integrate with Gravatar or other avatar services
    return `https://www.gravatar.com/avatar/${btoa(email)}?d=mp&s=40`;
  };

  // Helper function to decode HTML entities and render HTML content safely
  const renderCommentBody = (body: string | undefined) => {
    if (!body) return null;

    // Create a temporary div to decode HTML entities
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = body;
    const decodedText = tempDiv.textContent || tempDiv.innerText || body;

    // Normalize line breaks - replace multiple consecutive line breaks with single ones
    const normalizedText = decodedText.replace(/\n{3,}/g, "\n\n").trim();

    // Check if the content contains HTML tags
    const hasHtmlTags = /<[^>]*>/g.test(body);

    if (hasHtmlTags) {
      // For HTML content, normalize and use dangerouslySetInnerHTML
      // Note: In production, you should use a proper HTML sanitizer like DOMPurify
      const normalizedHtml = body
        .replace(/\n{3,}/g, "\n\n")
        .replace(/(<\/p>\s*){2,}/gi, "</p>")
        .replace(/(<br\s*\/?>){3,}/gi, "<br><br>")
        .trim();

      return (
        <Typography
          variant="body2"
          component="div"
          sx={{
            whiteSpace: "normal",
            "& p": { margin: 0, marginBottom: 1 },
            "& a": { color: "primary.main", textDecoration: "underline" },
            "& strong, & b": { fontWeight: 600 },
            "& em, & i": { fontStyle: "italic" },
          }}
          dangerouslySetInnerHTML={{ __html: normalizedHtml }}
        />
      );
    } else {
      // For plain text or text with entities, render as text
      return (
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {normalizedText}
        </Typography>
      );
    }
  };

  // Get status counts from API statistics
  const getStatusCounts = () => {
    const notApproved = statistics.NotApproved || 0;
    const approved = statistics.Approved || 0;
    const spam = statistics.Spam || 0;
    const answer = statistics.Answer || 0;
    const unanswered = statistics.Unanswered || 0;

    return {
      All: notApproved + approved + spam + answer, // Sum of all status counts
      NotApproved: notApproved,
      Approved: approved,
      Spam: spam,
      Answer: answer,
      Unanswered: unanswered,
    };
  };

  const statusCounts = getStatusCounts();

  // Format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "";
    }
  };

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
      setSelectAll(false);
    } else {
      const newSelection = [...selectedRows, id];
      setSelectedRows(newSelection);
      if (newSelection.length === comments.length) {
        setSelectAll(true);
      }
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      setSelectAll(false);
    } else {
      setSelectedRows(comments.map((comment) => comment.id?.toString() || ""));
      setSelectAll(true);
    }
  };

  // Open edit dialog
  const handleEditClick = (comment: EnhancedCommentDto) => {
    setSelectedComment(comment);
    setCommentBody(comment.body || "");
    setCommentAuthorName(comment.authorName || "");
    setCommentAuthorEmail(comment.authorEmail || "");
    setCommentStatus(comment.status || "NotApproved");
    setCommentAnswerStatus(comment.answerStatus || null);
    setCommentLanguage(comment.language || config?.defaultLanguage || "en-US");
    setDialogMode("edit");
  };

  // Handle comment save (edit or reply)
  const handleCommentSave = async () => {
    if (!commentBody.trim() || !commentAuthorName.trim() || !commentAuthorEmail.trim()) return;

    setIsSaving(true);
    try {
      if (dialogMode === "edit") {
        if (!selectedComment?.id) return;
        const updateData: Record<string, unknown> = {
          body: commentBody,
          authorName: commentAuthorName,
          authorEmail: commentAuthorEmail,
          status: commentStatus,
          language: commentLanguage,
        };
        if (commentAnswerStatus) {
          updateData.answerStatus = commentAnswerStatus;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await client.api.commentsPartialUpdate(selectedComment.id, updateData as any);
        notificationsService.success("Comment updated successfully");

        // Fetch the updated comment and refresh it in the list
        const response = await client.api.commentsDetail(selectedComment.id);
        if (response.data) {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === selectedComment.id ? { ...comment, ...response.data } : comment
            )
          );
        }
      } else if (dialogMode === "reply") {
        if (!selectedComment) return;
        const createData: Record<string, unknown> = {
          body: commentBody,
          authorName: commentAuthorName,
          authorEmail: commentAuthorEmail,
          status: commentStatus,
          parentId: selectedComment.id || undefined,
          language: commentLanguage,
        };
        if (selectedComment.commentableType) {
          createData.commentableType = selectedComment.commentableType;
        }
        if (selectedComment.commentableId !== undefined && selectedComment.commentableId !== null) {
          createData.commentableId = selectedComment.commentableId;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await client.api.commentsCreate(createData as any);
        notificationsService.success("Reply posted successfully");

        // Reload comments for replies since a new comment was added
        setComments([]);
        setTotalCount(0);
        initialLoadRef.current = false;
        loadComments();
      }

      setDialogMode(null);
      setSelectedComment(null);
      setCommentBody("");
      setCommentAuthorName("");
      setCommentAuthorEmail("");
      setCommentStatus("Approved");
      setCommentAnswerStatus(null);
      setCommentLanguage("");
    } catch (error) {
      notificationsService.error(
        `Failed to ${dialogMode === "edit" ? "update comment" : "post reply"}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Open reply dialog
  const handleReplyClick = (comment: EnhancedCommentDto) => {
    setSelectedComment(comment);
    setCommentBody("");
    setCommentAuthorName(
      userInfo?.details?.displayName ||
        userInfo?.details?.userName ||
        userInfo?.details?.email ||
        ""
    );
    setCommentAuthorEmail(userInfo?.details?.email || "");
    setCommentStatus("Approved");
    setCommentAnswerStatus(null);
    setCommentLanguage(comment.language || config?.defaultLanguage || "en-US");
    setDialogMode("reply");
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedComment?.id) return;

    setIsDeleting(true);
    try {
      await client.api.commentsDelete(selectedComment.id);
      notificationsService.success("Comment deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedComment(null);

      // Reload comments
      setComments([]);
      setTotalCount(0);
      initialLoadRef.current = false;
      loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      notificationsService.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (
    commentId: number,
    newStatus: "NotApproved" | "Approved" | "Spam" | "Answer"
  ) => {
    setStatusChangeLoading({ commentId, action: newStatus });
    try {
      const response = await client.api.commentsPartialUpdate(commentId, {
        status: newStatus,
      });

      // Update the comment in local state instead of reloading
      if (response.data) {
        setComments((prevComments) =>
          prevComments.map((c) => (c.id === commentId ? { ...c, ...response.data } : c))
        );
        notificationsService.success(`Comment status changed to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error changing status:", error);
      notificationsService.error("Failed to change comment status");
    } finally {
      setStatusChangeLoading(null);
    }
  };

  // Handle answer status change
  const handleAnswerStatusChange = async (
    commentId: number,
    newAnswerStatus: "Unanswered" | "Answered" | "Closed"
  ) => {
    setAnswerStatusChangeLoading({ commentId, action: newAnswerStatus });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await client.api.commentsPartialUpdate(commentId, {
        answerStatus: newAnswerStatus,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Update the comment in local state
      if (response.data) {
        setComments((prevComments) =>
          prevComments.map((c) => (c.id === commentId ? { ...c, ...response.data } : c))
        );
        notificationsService.success(`Answer status changed to ${newAnswerStatus}`);
      }
    } catch (error) {
      console.error("Error changing answer status:", error);
      notificationsService.error("Failed to change answer status");
    } finally {
      setAnswerStatusChangeLoading(null);
    }
  };

  // Handle bulk action selection (just store the selection)
  const handleBulkActionSelect = (action: string) => {
    setSelectedBulkAction(action);
  };

  // Handle bulk action apply
  const handleBulkActionApply = async () => {
    if (selectedRows.length === 0 || !selectedBulkAction) return;

    setIsBulkActionLoading(true);
    try {
      if (selectedBulkAction === "delete") {
        // Handle delete separately as it uses a different API
        const promises = selectedRows.map(async (commentId) => {
          const id = parseInt(commentId, 10);
          return client.api.commentsDelete(id);
        });

        await Promise.all(promises);

        // Reload to remove deleted items
        setComments([]);
        setTotalCount(0);
        initialLoadRef.current = false;
        loadComments();
      } else {
        // Use commentsImportCreate for bulk updates
        const updates = selectedRows.map((commentId) => {
          const id = parseInt(commentId, 10);
          const update: Record<string, unknown> = { id };

          if (selectedBulkAction === "approve") {
            update.status = "Approved";
          } else if (selectedBulkAction === "spam") {
            update.status = "Spam";
          } else if (selectedBulkAction === "closed") {
            update.answerStatus = "Closed";
          }

          return update;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await client.api.commentsImportCreate(updates as any);

        // Reload to get updated data
        setComments([]);
        setTotalCount(0);
        initialLoadRef.current = false;
        loadComments();
      }

      notificationsService.success(
        `${selectedBulkAction.charAt(0).toUpperCase() + selectedBulkAction.slice(1)} applied to ${
          selectedRows.length
        } comments`
      );
      setSelectedRows([]);
      setSelectAll(false);
      setSelectedBulkAction("");
    } catch (error) {
      console.error("Error in bulk action:", error);
      notificationsService.error("Failed to apply bulk action");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Cancel bulk action
  const handleBulkActionCancel = () => {
    setSelectedRows([]);
    setSelectAll(false);
    setSelectedBulkAction("");
  };

  // Effects - match content list pattern exactly
  useEffect(() => {
    setComments([]);
    setTotalCount(0);
    initialLoadRef.current = false;
    scrollTargetRef.current?.scrollTo?.(0, 0);
    loadComments().then(() => {
      initialLoadRef.current = true;
    });
    // eslint-disable-next-line
  }, [searchQuery, activeTab, selectedLanguage, whereFilters, sortField, sortDirection]);

  // Render comment component
  const renderComment = (comment: EnhancedCommentDto) => {
    // Get status display info based on API status
    const getStatusInfo = (status?: "NotApproved" | "Approved" | "Spam" | "Answer" | null) => {
      if (status === "Approved") {
        return { label: "Approved", color: "success" as const, icon: CheckCircle2 };
      }
      if (status === "Spam") {
        return { label: "Spam", color: "error" as const, icon: AlertCircle };
      }
      if (status === "Answer") {
        return { label: "Answer", color: "info" as const, icon: Reply };
      }
      return { label: "Not Approved", color: "warning" as const, icon: Clock };
    };

    const statusInfo = getStatusInfo(comment.status);

    return (
      <Card
        key={comment.id}
        sx={{
          mb: 2,
          transition: "box-shadow 0.3s ease-in-out",
          "&:hover": { boxShadow: 3 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            {/* Checkbox and Avatar */}
            <Grid size={{ xs: "auto" }}>
              <Checkbox
                checked={selectedRows.includes(comment.id?.toString() || "")}
                onChange={() => toggleRowSelection(comment.id?.toString() || "")}
                size="small"
                sx={{ p: 0, mt: 0.5 }}
              />
            </Grid>
            <Grid size={{ xs: "auto" }}>
              <Avatar
                src={comment.avatarUrl}
                alt={comment.authorName || ""}
                sx={{ width: 48, height: 48 }}
              >
                {comment.authorName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Grid>

            {/* Main Content */}
            <Grid size={{ xs: 12, sm: "grow" }}>
              {/* Header with author info and metadata */}
              <Box mb={2}>
                <Grid container spacing={1} alignItems="center" mb={1}>
                  <Grid size={{ xs: 12, md: "grow" }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {comment.authorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {comment.authorEmail}
                    </Typography>
                  </Grid>

                  {/* Status badges and metadata */}
                  <Grid size={{ xs: 12, md: "auto" }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      justifyContent={{ xs: "flex-start", md: "flex-end" }}
                      sx={{ gap: 1 }}
                    >
                      {comment.language && (
                        <Chip
                          label={comment.language.toUpperCase()}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                        />
                      )}
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        icon={<statusInfo.icon size={14} />}
                        sx={{ fontWeight: 500 }}
                      />
                      {comment.answerStatus && (
                        <Chip
                          label={comment.answerStatus}
                          size="small"
                          variant="outlined"
                          color={
                            comment.answerStatus === "Answered"
                              ? "success"
                              : comment.answerStatus === "Closed"
                              ? "default"
                              : "warning"
                          }
                          sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                        />
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                {/* Content reference and timestamp */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                    alignItems: { xs: "flex-start", sm: "center" },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    On:{" "}
                    <Link
                      to={comment.contentUrl || "#"}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          color: "primary.main",
                          fontWeight: 500,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {comment.contentTitle}
                      </Typography>
                    </Link>
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: "block", sm: "inline" } }}
                  >
                    {formatDate(comment.createdAt)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Comment body */}
              <Box
                sx={{
                  bgcolor: "grey.50",
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {renderCommentBody(comment.body)}
              </Box>

              {/* Actions */}
              <Box>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: "auto" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Reply size={16} />}
                      onClick={() => handleReplyClick(comment)}
                      fullWidth
                      sx={{ minWidth: { sm: 100 } }}
                    >
                      Reply
                    </Button>
                  </Grid>

                  {comment.status !== "Approved" && comment.status !== "Answer" && (
                    <Grid size={{ xs: 12, sm: "auto" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        startIcon={
                          statusChangeLoading?.commentId === comment.id &&
                          statusChangeLoading?.action === "Approved" ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )
                        }
                        onClick={() => handleStatusChange(comment.id || 0, "Approved")}
                        disabled={statusChangeLoading?.commentId === comment.id}
                        fullWidth
                        sx={{ minWidth: { sm: 100 } }}
                      >
                        Approve
                      </Button>
                    </Grid>
                  )}

                  {comment.status !== "Spam" && comment.status !== "Answer" && (
                    <Grid size={{ xs: 12, sm: "auto" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        startIcon={
                          statusChangeLoading?.commentId === comment.id &&
                          statusChangeLoading?.action === "Spam" ? (
                            <CircularProgress size={16} />
                          ) : (
                            <AlertCircle size={16} />
                          )
                        }
                        onClick={() => handleStatusChange(comment.id || 0, "Spam")}
                        disabled={statusChangeLoading?.commentId === comment.id}
                        fullWidth
                        sx={{ minWidth: { sm: 120 } }}
                      >
                        Mark as Spam
                      </Button>
                    </Grid>
                  )}

                  {comment.answerStatus !== "Answered" && (
                    <Grid size={{ xs: 12, sm: "auto" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        startIcon={
                          answerStatusChangeLoading?.commentId === comment.id &&
                          answerStatusChangeLoading?.action === "Answered" ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )
                        }
                        onClick={() => handleAnswerStatusChange(comment.id || 0, "Answered")}
                        disabled={answerStatusChangeLoading?.commentId === comment.id}
                        fullWidth
                        sx={{ minWidth: { sm: 120 } }}
                      >
                        Mark Answered
                      </Button>
                    </Grid>
                  )}

                  {comment.answerStatus !== "Closed" && (
                    <Grid size={{ xs: 12, sm: "auto" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          answerStatusChangeLoading?.commentId === comment.id &&
                          answerStatusChangeLoading?.action === "Closed" ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Clock size={16} />
                          )
                        }
                        onClick={() => handleAnswerStatusChange(comment.id || 0, "Closed")}
                        disabled={answerStatusChangeLoading?.commentId === comment.id}
                        fullWidth
                        sx={{ minWidth: { sm: 100 } }}
                      >
                        Mark Closed
                      </Button>
                    </Grid>
                  )}

                  <Grid size={{ xs: 6, sm: "auto" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit size={16} />}
                      onClick={() => handleEditClick(comment)}
                      fullWidth
                      sx={{ minWidth: { sm: 80 } }}
                    >
                      Edit
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 6, sm: "auto" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<Trash2 size={16} />}
                      onClick={() => {
                        setSelectedComment(comment);
                        setIsDeleteDialogOpen(true);
                      }}
                      fullWidth
                      sx={{ minWidth: { sm: 80 } }}
                    >
                      Delete
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Search bar component
  const searchBar = (
    <SearchBar
      searchBoxLabel="Search comments"
      setSearchTermOnChange={setSearchQuery}
      initialValue={searchQuery}
    />
  );

  // Sort button click handler
  const handleSortButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };
  const handleSortPopupClose = () => setSortAnchorEl(null);
  const handleSortDirectionToggle = () => setSortDirection((d) => (d === "asc" ? "desc" : "asc"));

  const sortLabel = (() => {
    switch (sortField) {
      case "createdAt":
        return "Created At";
      case "updatedAt":
        return "Updated At";
      case "body":
        return "Body";
      case "status":
        return "Status";
      case "language":
        return "Language";
      default:
        return sortField;
    }
  })();

  // Extra actions for toolbar
  const extraActions = [
    <ToolbarButton
      key="sort"
      onClick={handleSortButtonClick}
      startIcon={sortDirection === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
      sx={{ gap: 1 }}
    >
      <span>Sort:</span>
      <span>{sortLabel}</span>
    </ToolbarButton>,
    <ToolbarButton
      key="filter"
      onClick={() => setFilterPanelOpen(true)}
      startIcon={<Filter size={18} />}
      sx={{
        minWidth: 0,
        py: 2,
        px: 2,
        ".MuiButton-startIcon": { marginRight: 0, marginLeft: 0 },
      }}
    />,
    <ToolbarButton
      key="export"
      startIcon={<Download size={18} />}
      onClick={() => {
        /* TODO: Implement export */
      }}
    >
      Export
    </ToolbarButton>,
  ];

  return (
    <>
      <ModuleWrapper
        breadcrumbs={dataListBreadcrumbLinks}
        currentBreadcrumb="Comments"
        leftContainerChildren={searchBar}
        extraActionsContainerChildren={extraActions}
      >
        <CustomFilterBar
          columns={commentFilterColumns}
          whereFilters={whereFilters}
          addFilter={addFilter}
          removeFilter={removeFilter}
          filterPanelOpen={filterPanelOpen}
          setFilterPanelOpen={setFilterPanelOpen}
          clearAllFilters={clearAllFilters}
        />

        <Box>
          {/* Status tabs */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              bgcolor: "background.paper",
              zIndex: 10,
              borderBottom: 1,
              borderColor: "divider",
              overflow: "auto",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab
                value="All"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MessageSquare size={16} />
                    <Typography variant="body2" fontWeight={500}>
                      All
                    </Typography>
                    <Chip label={statusCounts.All} size="small" />
                  </Stack>
                }
              />
              <Tab
                value="NotApproved"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Clock size={16} />
                    <Typography variant="body2" fontWeight={500}>
                      Not Approved
                    </Typography>
                    <Chip label={statusCounts.NotApproved} size="small" />
                  </Stack>
                }
              />
              <Tab
                value="Approved"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle2 size={16} />
                    <Typography variant="body2" fontWeight={500}>
                      Approved
                    </Typography>
                    <Chip label={statusCounts.Approved} size="small" />
                  </Stack>
                }
              />
              <Tab
                value="Spam"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AlertCircle size={16} />
                    <Typography variant="body2" fontWeight={500}>
                      Spam
                    </Typography>
                    <Chip label={statusCounts.Spam} size="small" />
                  </Stack>
                }
              />
              <Tab
                value="Answer"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Reply size={16} />
                    <Typography variant="body2" fontWeight={500}>
                      Answer
                    </Typography>
                    <Chip label={statusCounts.Answer} size="small" />
                  </Stack>
                }
              />
              <Tab
                value="Unanswered"
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MessageCircle size={16} />
                    <Typography variant="body2" fontWeight={500}>
                      Unanswered
                    </Typography>
                    <Chip label={statusCounts.Unanswered} size="small" />
                  </Stack>
                }
              />
            </Tabs>
          </Box>

          {/* Bulk actions bar */}
          {selectedRows.length > 0 && (
            <Card
              sx={{
                position: "sticky",
                top: 48,
                bgcolor: "primary.50",
                mb: 3,
                borderLeft: 4,
                borderColor: "primary.main",
                zIndex: 9,
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {selectedRows.length} comment{selectedRows.length !== 1 ? "s" : ""} selected
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      justifyContent: { xs: "stretch", sm: "flex-end" },
                    }}
                  >
                    <FormControl
                      size="small"
                      sx={{
                        minWidth: { xs: "100%", sm: 200 },
                        maxWidth: { xs: "100%", sm: 200 },
                      }}
                    >
                      <InputLabel>Bulk Actions</InputLabel>
                      <Select
                        label="Bulk Actions"
                        onChange={(e: SelectChangeEvent) => handleBulkActionSelect(e.target.value)}
                        value={selectedBulkAction}
                      >
                        <MenuItem value="approve">Approve Selected</MenuItem>
                        <MenuItem value="spam">Mark as Spam</MenuItem>
                        <MenuItem value="closed">Mark as Closed</MenuItem>
                        <MenuItem value="delete">Delete Selected</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleBulkActionCancel}
                      sx={{ minWidth: 100 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleBulkActionApply}
                      disabled={!selectedBulkAction || isBulkActionLoading}
                      startIcon={isBulkActionLoading ? <CircularProgress size={16} /> : undefined}
                      sx={{ minWidth: 100 }}
                    >
                      Apply
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Comments list */}
          {loading && comments.length === 0 ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : comments.length === 0 ? (
            <NoRecordsDisplay
              visible={true}
              message="No comments found"
              activeFilters={{
                searchTerm: searchQuery.trim() || undefined,
                customFilters:
                  whereFilters.length > 0
                    ? whereFilters.map((f) => ({
                        field: f.whereField,
                        operator: f.whereOperator,
                        value: f.whereFieldValue,
                      }))
                    : undefined,
                languageFilter: isLanguageFilterActive ? selectedLanguage : undefined,
              }}
              onClearFilters={() => {
                setSearchQuery("");
                setWhereFilters([]);
                setActiveTab("All");
              }}
            />
          ) : (
            <>
              {/* Select all checkbox */}
              <Box sx={{ ml: { xs: 2, sm: 3 }, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll}
                      indeterminate={selectedRows.length > 0 && !selectAll}
                      onChange={toggleSelectAll}
                      size="small"
                    />
                  }
                  label={`Select all (${comments.length})`}
                />
              </Box>

              {/* Comments with InfiniteScroll */}
              <InfiniteScroll
                dataLength={comments.length}
                next={loadComments}
                hasMore={totalCount !== comments.length}
                loader={comments.length < totalCount ? <h4>Loading more comments...</h4> : null}
                hasChildren={true}
                scrollableTarget="scrollTarget"
                style={{ overflow: "unset" }}
              >
                <Box id="scrollTarget" ref={scrollTargetRef}>
                  {comments.map((comment) => renderComment(comment))}
                </Box>
              </InfiniteScroll>
            </>
          )}
        </Box>
      </ModuleWrapper>

      {/* Unified Comment Dialog (Edit/Reply) */}
      <Dialog
        open={dialogMode !== null}
        onClose={() => setDialogMode(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{dialogMode === "edit" ? "Edit Comment" : "Reply to Comment"}</DialogTitle>
        <DialogContent>
          {dialogMode === "reply" && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Replying to comment by {selectedComment?.authorName}
              </Typography>
              <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
                <CardContent>{renderCommentBody(selectedComment?.body)}</CardContent>
              </Card>
            </Box>
          )}

          <Grid container spacing={2} sx={{ mt: dialogMode === "edit" ? 0 : 1 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                {dialogMode === "edit" ? "Comment Body" : "Your Reply"} *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={dialogMode === "edit" ? 6 : 4}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={dialogMode === "edit" ? "Edit comment body..." : "Write reply..."}
                required
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Author Name"
                value={commentAuthorName}
                onChange={(e) => setCommentAuthorName(e.target.value)}
                placeholder="Enter author name"
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Author Email"
                type="email"
                value={commentAuthorEmail}
                onChange={(e) => setCommentAuthorEmail(e.target.value)}
                placeholder="Enter author email"
                required
              />
            </Grid>

            {dialogMode === "edit" && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={commentStatus}
                      label="Status"
                      onChange={(e) =>
                        setCommentStatus(
                          e.target.value as "NotApproved" | "Approved" | "Spam" | "Answer"
                        )
                      }
                    >
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="NotApproved">Not Approved</MenuItem>
                      <MenuItem value="Spam">Spam</MenuItem>
                      <MenuItem value="Answer">Answer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={commentLanguage}
                      label="Language"
                      onChange={(e) => setCommentLanguage(e.target.value)}
                    >
                      {config?.languages?.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Answer Status</InputLabel>
                    <Select
                      value={commentAnswerStatus || ""}
                      label="Answer Status"
                      onChange={(e) =>
                        setCommentAnswerStatus(
                          (e.target.value as "Unanswered" | "Answered" | "Closed") || null
                        )
                      }
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="Unanswered">Unanswered</MenuItem>
                      <MenuItem value="Answered">Answered</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button
            onClick={handleCommentSave}
            variant="contained"
            disabled={
              !commentBody.trim() ||
              !commentAuthorName.trim() ||
              !commentAuthorEmail.trim() ||
              isSaving
            }
            startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
          >
            {dialogMode === "edit" ? "Save Changes" : "Post Reply"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <CommentSortPopup
        anchorEl={sortAnchorEl}
        open={!!sortAnchorEl}
        selectedField={sortField}
        direction={sortDirection}
        onClose={handleSortPopupClose}
        onChangeField={(f: string) => {
          setSortField(f);
          handleSortPopupClose();
        }}
        onToggleDirection={handleSortDirectionToggle}
      />
    </>
  );
};
