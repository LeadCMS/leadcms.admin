import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AlertCircle, CheckCircle2, Clock, Edit, MessageSquare, Reply, Trash2 } from "lucide-react";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useRequestContext } from "@providers/request-provider";
import { useUserInfo } from "@providers/user-provider";
import { useConfig } from "@providers/config-provider";
import { useNotificationsService } from "@hooks";
import { showApiError, parseApiError } from "@utils/api-error-parser";
import { CommentBody } from "@components/comment-body";
import {
  CommentCreateBaseDto,
  CommentDetailsDto,
  CommentUpdateDto,
} from "@lib/network/swagger-client";

export interface ContentCommentsTabProps {
  contentId: number;
}

type CommentStatus = "NotApproved" | "Approved" | "Spam" | "Answer";
type AnswerStatus = "Unanswered" | "Answered" | "Closed";

interface CommentNode extends CommentDetailsDto {
  children: CommentNode[];
}

type DialogMode = "edit" | "reply" | null;

const generateAvatarUrl = (email?: string | null): string | undefined => {
  if (!email) return undefined;
  return `https://www.gravatar.com/avatar/${btoa(email)}?d=mp&s=40`;
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return "";
  }
};

const getStatusInfo = (status?: CommentStatus | null) => {
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

/**
 * Build a threaded tree from a flat list of comments.
 * - Root comments (no parentId) are sorted newest first.
 * - Replies within a thread are sorted oldest first, so the conversation reads
 *   in chronological order under each root.
 */
const buildCommentTree = (comments: CommentDetailsDto[]): CommentNode[] => {
  const byId = new Map<number, CommentNode>();
  comments.forEach((c) => {
    if (c.id != null) {
      byId.set(c.id, { ...c, children: [] });
    }
  });

  const roots: CommentNode[] = [];
  byId.forEach((node) => {
    if (node.parentId != null && byId.has(node.parentId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortByCreatedAsc = (a: CommentNode, b: CommentNode) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  };
  const sortByCreatedDesc = (a: CommentNode, b: CommentNode) => -sortByCreatedAsc(a, b);

  const sortReplies = (node: CommentNode) => {
    node.children.sort(sortByCreatedAsc);
    node.children.forEach(sortReplies);
  };

  roots.sort(sortByCreatedDesc);
  roots.forEach(sortReplies);
  return roots;
};

export const ContentCommentsTab = ({ contentId }: ContentCommentsTabProps) => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const userInfo = useUserInfo();
  const { config } = useConfig();

  const [comments, setComments] = useState<CommentDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Dialog state
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedComment, setSelectedComment] = useState<CommentDetailsDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state (edit/reply)
  const [commentBody, setCommentBody] = useState("");
  const [commentAuthorName, setCommentAuthorName] = useState("");
  const [commentAuthorEmail, setCommentAuthorEmail] = useState("");
  const [commentStatus, setCommentStatus] = useState<CommentStatus>("Approved");
  const [commentAnswerStatus, setCommentAnswerStatus] = useState<AnswerStatus | null>(null);
  const [commentLanguage, setCommentLanguage] = useState("");
  const [commentPublishedAt, setCommentPublishedAt] = useState<Dayjs | null>(null);

  // Per-row loading flags
  const [statusChangeLoading, setStatusChangeLoading] = useState<{
    commentId: number;
    action: string;
  } | null>(null);
  const [answerStatusChangeLoading, setAnswerStatusChangeLoading] = useState<{
    commentId: number;
    action: string;
  } | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await client.api.contentCommentsList(contentId);
      setComments(data || []);
    } catch (error) {
      const apiError = parseApiError(error, "Failed to load comments");
      setLoadError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [client, contentId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  const resetFormState = () => {
    setDialogMode(null);
    setSelectedComment(null);
    setCommentBody("");
    setCommentAuthorName("");
    setCommentAuthorEmail("");
    setCommentStatus("Approved");
    setCommentAnswerStatus(null);
    setCommentLanguage("");
    setCommentPublishedAt(null);
  };

  const handleEditClick = (comment: CommentDetailsDto) => {
    setSelectedComment(comment);
    setCommentBody(comment.body || "");
    setCommentAuthorName(comment.authorName || "");
    setCommentAuthorEmail(comment.authorEmail || "");
    setCommentStatus(comment.status || "NotApproved");
    setCommentAnswerStatus(comment.answerStatus || null);
    setCommentLanguage(comment.language || config?.defaultLanguage || "en-US");
    setCommentPublishedAt(comment.publishedAt ? dayjs(comment.publishedAt) : null);
    setDialogMode("edit");
  };

  const handleReplyClick = (comment: CommentDetailsDto) => {
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
    setCommentPublishedAt(null);
    setDialogMode("reply");
  };

  const updateCommentInState = (updated: CommentDetailsDto) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

  const handleCommentSave = async () => {
    if (!commentBody.trim() || !commentAuthorName.trim() || !commentAuthorEmail.trim()) return;

    setIsSaving(true);
    try {
      if (dialogMode === "edit") {
        if (!selectedComment?.id) return;
        const updateData: CommentUpdateDto = {
          body: commentBody,
          authorName: commentAuthorName,
          authorEmail: commentAuthorEmail,
          status: commentStatus,
          language: commentLanguage,
          publishedAt: commentPublishedAt ? commentPublishedAt.toISOString() : null,
        };
        if (commentAnswerStatus) {
          updateData.answerStatus = commentAnswerStatus;
        }
        await client.api.commentsPartialUpdate(selectedComment.id, updateData);
        notificationsService.success("Comment updated successfully");
        const response = await client.api.commentsDetail(selectedComment.id);
        if (response.data) {
          updateCommentInState(response.data);
        }
      } else if (dialogMode === "reply") {
        if (!selectedComment) return;
        const createData: CommentCreateBaseDto = {
          body: commentBody,
          authorName: commentAuthorName,
          authorEmail: commentAuthorEmail,
          parentId: selectedComment.id || undefined,
          language: commentLanguage,
          publishedAt: commentPublishedAt ? commentPublishedAt.toISOString() : undefined,
        };
        await client.api.contentCommentsCreate(contentId, createData);
        notificationsService.success("Reply posted successfully");
        await loadComments();
      }
      resetFormState();
    } catch (error) {
      showApiError(
        error,
        notificationsService,
        undefined,
        `Failed to ${dialogMode === "edit" ? "update comment" : "post reply"}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedComment?.id) return;
    setIsDeleting(true);
    try {
      await client.api.commentsDelete(selectedComment.id);
      notificationsService.success("Comment deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedComment(null);
      await loadComments();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (commentId: number, newStatus: CommentStatus) => {
    setStatusChangeLoading({ commentId, action: newStatus });
    try {
      const response = await client.api.commentsPartialUpdate(commentId, { status: newStatus });
      if (response.data) {
        updateCommentInState(response.data);
        notificationsService.success(`Comment status changed to ${newStatus}`);
      }
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to change comment status");
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const handleAnswerStatusChange = async (commentId: number, newAnswerStatus: AnswerStatus) => {
    setAnswerStatusChangeLoading({ commentId, action: newAnswerStatus });
    try {
      const response = await client.api.commentsPartialUpdate(commentId, {
        answerStatus: newAnswerStatus,
      });
      if (response.data) {
        updateCommentInState(response.data);
        notificationsService.success(`Answer status changed to ${newAnswerStatus}`);
      }
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to change answer status");
    } finally {
      setAnswerStatusChangeLoading(null);
    }
  };

  const renderComment = (node: CommentNode, depth: number): React.ReactNode => {
    const isRoot = depth === 0;
    const statusInfo = getStatusInfo(node.status);
    const avatarUrl = node.avatarUrl || generateAvatarUrl(node.authorEmail);

    return (
      <Box key={node.id} sx={{ mb: isRoot ? 3 : 2 }}>
        <Card
          variant={isRoot ? "elevation" : "outlined"}
          sx={{
            transition: "box-shadow 0.2s ease-in-out",
            "&:hover": { boxShadow: isRoot ? 3 : 1 },
            borderLeft: isRoot ? 4 : undefined,
            borderLeftColor: isRoot ? "primary.main" : undefined,
            bgcolor: isRoot ? "background.paper" : "grey.50",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: "auto" }}>
                <Avatar
                  src={avatarUrl}
                  alt={node.authorName || ""}
                  sx={{ width: isRoot ? 44 : 36, height: isRoot ? 44 : 36 }}
                >
                  {node.authorName?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Grid>
              <Grid size={{ xs: 12, sm: "grow" }}>
                <Box sx={{ mb: 1.5 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid size={{ xs: 12, md: "grow" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 0.25,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          {node.authorName}
                        </Typography>
                        <Chip
                          label={`#${node.id}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem", height: 20, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(node.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {node.authorEmail}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: "auto" }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        justifyContent={{ xs: "flex-start", md: "flex-end" }}
                        sx={{ gap: 1 }}
                      >
                        {node.language && (
                          <Chip
                            label={node.language.toUpperCase()}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                          />
                        )}
                        <Chip
                          label={statusInfo.label}
                          color={statusInfo.color}
                          size="small"
                          icon={<statusInfo.icon size={14} />}
                          sx={{ fontWeight: 500 }}
                        />
                        {node.answerStatus && (
                          <Chip
                            label={node.answerStatus}
                            size="small"
                            variant="outlined"
                            color={
                              node.answerStatus === "Answered"
                                ? "success"
                                : node.answerStatus === "Closed"
                                ? "default"
                                : "warning"
                            }
                            sx={{ fontSize: "0.7rem", fontWeight: 500 }}
                          />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                <Box
                  sx={{
                    bgcolor: isRoot ? "grey.50" : "background.paper",
                    p: 1.5,
                    borderRadius: 1,
                    mb: 1.5,
                    border: "1px solid",
                    borderColor: "grey.200",
                    maxHeight: 300,
                    overflow: "auto",
                  }}
                >
                  {<CommentBody body={node.body} />}
                </Box>

                <Box>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: "auto" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Reply size={16} />}
                        onClick={() => handleReplyClick(node)}
                        fullWidth
                        sx={{ minWidth: { sm: 100 } }}
                      >
                        Reply
                      </Button>
                    </Grid>
                    {node.status !== "Approved" && node.status !== "Answer" && (
                      <Grid size={{ xs: 12, sm: "auto" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          startIcon={
                            statusChangeLoading?.commentId === node.id &&
                            statusChangeLoading?.action === "Approved" ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )
                          }
                          onClick={() => handleStatusChange(node.id || 0, "Approved")}
                          disabled={statusChangeLoading?.commentId === node.id}
                          fullWidth
                          sx={{ minWidth: { sm: 100 } }}
                        >
                          Approve
                        </Button>
                      </Grid>
                    )}
                    {node.status !== "Spam" && node.status !== "Answer" && (
                      <Grid size={{ xs: 12, sm: "auto" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          startIcon={
                            statusChangeLoading?.commentId === node.id &&
                            statusChangeLoading?.action === "Spam" ? (
                              <CircularProgress size={16} />
                            ) : (
                              <AlertCircle size={16} />
                            )
                          }
                          onClick={() => handleStatusChange(node.id || 0, "Spam")}
                          disabled={statusChangeLoading?.commentId === node.id}
                          fullWidth
                          sx={{ minWidth: { sm: 120 } }}
                        >
                          Mark as Spam
                        </Button>
                      </Grid>
                    )}
                    {node.answerStatus !== "Answered" && (
                      <Grid size={{ xs: 12, sm: "auto" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          startIcon={
                            answerStatusChangeLoading?.commentId === node.id &&
                            answerStatusChangeLoading?.action === "Answered" ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )
                          }
                          onClick={() => handleAnswerStatusChange(node.id || 0, "Answered")}
                          disabled={answerStatusChangeLoading?.commentId === node.id}
                          fullWidth
                          sx={{ minWidth: { sm: 120 } }}
                        >
                          Mark Answered
                        </Button>
                      </Grid>
                    )}
                    {node.answerStatus !== "Closed" && (
                      <Grid size={{ xs: 12, sm: "auto" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={
                            answerStatusChangeLoading?.commentId === node.id &&
                            answerStatusChangeLoading?.action === "Closed" ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Clock size={16} />
                            )
                          }
                          onClick={() => handleAnswerStatusChange(node.id || 0, "Closed")}
                          disabled={answerStatusChangeLoading?.commentId === node.id}
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
                        onClick={() => handleEditClick(node)}
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
                          setSelectedComment(node);
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

        {node.children.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              ml: { xs: 2, sm: 4 },
              pl: { xs: 1.5, sm: 2 },
              borderLeft: "2px solid",
              borderLeftColor: "divider",
            }}
          >
            {node.children.map((child) => renderComment(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ pt: 2 }}>
      {loading && comments.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : loadError ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            border: "2px dashed",
            borderColor: "grey.300",
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <AlertCircle size={40} color="#d32f2f" />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Error loading comments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loadError}
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={loadComments}>
            Retry
          </Button>
        </Box>
      ) : tree.length === 0 ? (
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            border: "2px dashed",
            borderColor: "grey.300",
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <MessageSquare size={48} color="#9e9e9e" />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            No comments yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comments left on this content will appear here.
          </Typography>
        </Box>
      ) : (
        <Box>{tree.map((root) => renderComment(root, 0))}</Box>
      )}

      <Dialog
        open={dialogMode !== null}
        onClose={() => resetFormState()}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: "90vh", maxHeight: "90vh", display: "flex", flexDirection: "column" },
        }}
      >
        <DialogTitle>{dialogMode === "edit" ? "Edit Comment" : "Reply to Comment"}</DialogTitle>
        <DialogContent
          sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", pb: 1 }}
        >
          {dialogMode === "reply" && selectedComment && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Replying to comment by {selectedComment.authorName}
              </Typography>
              <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
                <CardContent>
                  <CommentBody body={selectedComment.body} />
                </CardContent>
              </Card>
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              mt: dialogMode === "edit" ? 0 : 1,
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle2" gutterBottom>
                {dialogMode === "edit" ? "Comment Body" : "Your Reply"} *
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gridTemplateRows: { xs: "1fr 1fr", sm: "1fr" },
                  gap: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {/* Editor pane */}
                <Box
                  sx={{
                    borderRight: { xs: "none", sm: "1px solid" },
                    borderBottom: { xs: "1px solid", sm: "none" },
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: "grey.50",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      color: "text.secondary",
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    Write
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder={dialogMode === "edit" ? "Edit comment body..." : "Write reply..."}
                    required
                    variant="outlined"
                    sx={{
                      flex: 1,
                      overflow: "hidden",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 0,
                        height: "100%",
                        alignItems: "flex-start",
                        overflow: "auto",
                        // Match Typography body2 used by the Preview pane so the two
                        // sides align visually line-for-line.
                        fontSize: "0.875rem",
                        lineHeight: 1.43,
                      },
                      "& .MuiInputBase-inputMultiline": {
                        height: "100% !important",
                        overflow: "auto !important",
                        resize: "none",
                      },
                    }}
                  />
                </Box>
                {/* Preview pane */}
                <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: "grey.50",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      color: "text.secondary",
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    Preview
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 0,
                      bgcolor: "background.paper",
                      overflow: "auto",
                    }}
                  >
                    <CommentBody body={commentBody} showEmptyPlaceholder />
                  </Paper>
                </Box>
              </Box>
            </Box>
          </Box>
          <Grid container spacing={2}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <DateTimePicker
                label="Published At"
                format="L HH:mm"
                slotProps={{ textField: { fullWidth: true } }}
                value={commentPublishedAt}
                onChange={(val) => setCommentPublishedAt(val)}
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
                      onChange={(e) => setCommentStatus(e.target.value as CommentStatus)}
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
                        setCommentAnswerStatus((e.target.value as AnswerStatus) || null)
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
          <Button onClick={() => resetFormState()}>Cancel</Button>
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
    </Box>
  );
};
