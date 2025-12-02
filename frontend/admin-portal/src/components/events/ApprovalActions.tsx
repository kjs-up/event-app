import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Chip,
  Paper,
  Divider,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as RevisionIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { EventApproval, EventProject } from '../../services/events.service';
import { useRole } from '../../hooks/useRole';

interface ApprovalActionsProps {
  approval: EventApproval;
  eventProject?: EventProject;
  onApprove?: (approvalId: string, comments?: string) => Promise<void>;
  onReject?: (approvalId: string, rejectionReason: string, comments?: string) => Promise<void>;
  onRequestRevision?: (approvalId: string, comments: string) => Promise<void>;
  onCancel?: (approvalId: string) => Promise<void>;
  disabled?: boolean;
  compact?: boolean;
}

type ActionType = 'approve' | 'reject' | 'revision' | null;

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  approval,
  eventProject,
  onApprove,
  onReject,
  onRequestRevision,
  onCancel,
  disabled = false,
  compact = false,
}) => {
  const { permissions, isOwner } = useRole();
  const [actionType, setActionType] = useState<ActionType>(null);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canApprove = permissions.canApproveEvents && !isOwner(approval.submittedBy);
  const canReject = permissions.canRejectEvents && !isOwner(approval.submittedBy);
  const canRequestRevision = permissions.canRequestRevisions && !isOwner(approval.submittedBy);
  const canCancel = isOwner(approval.submittedBy) || permissions.canAccessAdminFeatures;

  const isExpired = approval.expiresAt && new Date(approval.expiresAt) < new Date();
  const isPending = approval.status === 'pending';
  const isCompleted = approval.status === 'completed';

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <ApproveIcon color="success" />;
      case 'rejected':
        return <RejectIcon color="error" />;
      case 'revision_requested':
        return <RevisionIcon color="warning" />;
      default:
        return <TimeIcon color="primary" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'submitted':
        return 'Submitted for Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'revision_requested':
        return 'Revision Requested';
      default:
        return action;
    }
  };

  const handleAction = async (type: ActionType) => {
    if (!type) return;

    setLoading(true);
    setError(null);

    try {
      switch (type) {
        case 'approve':
          if (onApprove) {
            await onApprove(approval.id, comments || undefined);
          }
          break;
        case 'reject':
          if (onReject && rejectionReason.trim()) {
            await onReject(approval.id, rejectionReason, comments || undefined);
          }
          break;
        case 'revision':
          if (onRequestRevision && comments.trim()) {
            await onRequestRevision(approval.id, comments);
          }
          break;
      }

      // Reset form
      setActionType(null);
      setComments('');
      setRejectionReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;

    setLoading(true);
    try {
      await onCancel(approval.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel approval');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    if (!loading) {
      setActionType(null);
      setComments('');
      setRejectionReason('');
      setError(null);
    }
  };

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          icon={getActionIcon(approval.action)}
          label={getActionLabel(approval.action)}
          size="small"
          color={
            approval.action === 'approved' ? 'success' :
            approval.action === 'rejected' ? 'error' :
            approval.action === 'revision_requested' ? 'warning' :
            'default'
          }
        />
        {isPending && (
          <Typography variant="caption" color="text.secondary">
            {approval.expiresAt && `Expires ${formatDistanceToNow(new Date(approval.expiresAt), { addSuffix: true })}`}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {getActionIcon(approval.action)}
            <Typography variant="h6">
              {getActionLabel(approval.action)}
            </Typography>
          </Box>

          <Chip
            label={approval.status}
            size="small"
            color={
              approval.status === 'completed' ? 'success' :
              approval.status === 'pending' ? 'warning' :
              'default'
            }
          />
        </Box>

        {/* Approval Details */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              Submitted by: {approval.submitter?.firstName} {approval.submitter?.lastName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <TimeIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              Submitted: {format(new Date(approval.createdAt), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Grid>
          {approval.expiresAt && (
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color={isExpired ? 'error.main' : 'text.secondary'}
              >
                {isExpired ? '⚠️ Expired: ' : 'Expires: '}
                {format(new Date(approval.expiresAt), 'MMM dd, yyyy HH:mm')}
                {!isExpired && ` (${formatDistanceToNow(new Date(approval.expiresAt), { addSuffix: true })})`}
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Comments */}
        {approval.comments && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Submitter Comments:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {approval.comments}
            </Typography>
          </Box>
        )}

        {/* Decision Details */}
        {isCompleted && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Decision Details:
              </Typography>
              <Grid container spacing={2}>
                {approval.approver && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Reviewed by: {approval.approver.firstName} {approval.approver.lastName}
                    </Typography>
                  </Grid>
                )}
                {approval.approvedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Date: {format(new Date(approval.approvedAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                )}
                {approval.rejectedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Date: {format(new Date(approval.rejectedAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {approval.rejectionReason && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="error.main">
                    <strong>Rejection Reason:</strong> {approval.rejectionReason}
                  </Typography>
                </Box>
              )}

              {approval.comments && approval.action !== 'submitted' && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Comments:</strong> {approval.comments}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Actions */}
        {isPending && !isExpired && !disabled && (
          <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
            {canApprove && (
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => setActionType('approve')}
                disabled={loading}
              >
                Approve
              </Button>
            )}

            {canReject && (
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => setActionType('reject')}
                disabled={loading}
              >
                Reject
              </Button>
            )}

            {canRequestRevision && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RevisionIcon />}
                onClick={() => setActionType('revision')}
                disabled={loading}
              >
                Request Revision
              </Button>
            )}

            {canCancel && (
              <Button
                variant="text"
                color="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? <CircularProgress size={16} /> : 'Cancel Request'}
              </Button>
            )}
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Action Dialog */}
      <Dialog
        open={actionType !== null}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'approve' && 'Approve Event'}
          {actionType === 'reject' && 'Reject Event'}
          {actionType === 'revision' && 'Request Revision'}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {actionType === 'reject' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why this event is being rejected..."
              margin="normal"
              required
            />
          )}

          <TextField
            fullWidth
            multiline
            rows={actionType === 'revision' ? 4 : 3}
            label={
              actionType === 'approve' ? 'Comments (optional)' :
              actionType === 'reject' ? 'Additional Comments (optional)' :
              'Revision Comments *'
            }
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              actionType === 'approve' ? 'Add any comments about the approval...' :
              actionType === 'reject' ? 'Add any additional context...' :
              'Please explain what needs to be revised...'
            }
            margin="normal"
            required={actionType === 'revision'}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => handleAction(actionType)}
            variant="contained"
            disabled={
              loading ||
              (actionType === 'reject' && !rejectionReason.trim()) ||
              (actionType === 'revision' && !comments.trim())
            }
            color={
              actionType === 'approve' ? 'success' :
              actionType === 'reject' ? 'error' :
              'warning'
            }
          >
            {loading ? <CircularProgress size={20} /> : (
              actionType === 'approve' ? 'Approve Event' :
              actionType === 'reject' ? 'Reject Event' :
              'Request Revision'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApprovalActions;