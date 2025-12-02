import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  Tooltip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { EventProject } from '../../services/events.service';
import { useRole } from '../../hooks/useRole';

interface EventCardProps {
  event: EventProject;
  onEdit?: (event: EventProject) => void;
  onDelete?: (event: EventProject) => void;
  onSubmitForApproval?: (event: EventProject) => void;
  onView?: (event: EventProject) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
}

const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'draft':
      return 'default';
    case 'pending_approval':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'archived':
      return 'secondary';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'pending_approval':
      return 'Pending Approval';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
};

const getEventTypeIcon = (eventType: string) => {
  switch (eventType) {
    case 'training':
      return '🎓';
    case 'seminar':
      return '📚';
    case 'concert':
      return '🎵';
    case 'entertainment':
      return '🎭';
    case 'foundation':
      return '🏛️';
    default:
      return '📅';
  }
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onSubmitForApproval,
  onView,
  variant = 'default',
  showActions = true,
}) => {
  const { canModifyEvent, canViewEvent, permissions, isOwner } = useRole();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const canEdit = canModifyEvent(event.createdBy, event.status);
  const canDelete = isOwner(event.createdBy) && event.status === 'draft';
  const canSubmit = isOwner(event.createdBy) && (event.status === 'draft' || event.status === 'rejected');
  const canViewDetails = canViewEvent(event.createdBy, event.status);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  if (!canViewDetails) {
    return null;
  }

  const cardContent = (
    <CardContent sx={{ pb: variant === 'compact' ? 1 : 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box display="flex" alignItems="center" gap={1} flex={1}>
          <Typography variant="h6" component="span">
            {getEventTypeIcon(event.eventType)}
          </Typography>
          <Typography
            variant={variant === 'compact' ? 'subtitle2' : 'h6'}
            component="h3"
            noWrap
            sx={{ fontWeight: 'medium' }}
          >
            {event.name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={getStatusLabel(event.status)}
            color={getStatusColor(event.status)}
            size="small"
          />
          {showActions && (canEdit || canDelete || canSubmit) && (
            <IconButton
              size="small"
              onClick={handleMenuClick}
              aria-label="Event actions"
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Description */}
      {variant !== 'compact' && event.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </Typography>
      )}

      {/* Event Details */}
      <Box display="flex" flexWrap="wrap" gap={1} mb={variant === 'detailed' ? 2 : 1}>
        <Tooltip title="Event Type">
          <Chip
            icon={<EventIcon />}
            label={event.eventType}
            variant="outlined"
            size="small"
          />
        </Tooltip>

        <Tooltip title="Max Capacity">
          <Chip
            icon={<PeopleIcon />}
            label={`${event.maxCapacity} people`}
            variant="outlined"
            size="small"
          />
        </Tooltip>

        {event.isPaid && (
          <Tooltip title="Paid Event">
            <Chip
              icon={<MoneyIcon />}
              label={`${event.currency} ${event.basePrice}`}
              variant="outlined"
              size="small"
              color="primary"
            />
          </Tooltip>
        )}

        {event.hasSpeakers && (
          <Tooltip title="Has Speakers">
            <Chip
              icon={<PersonIcon />}
              label="Speakers"
              variant="outlined"
              size="small"
              color="secondary"
            />
          </Tooltip>
        )}
      </Box>

      {/* Timestamps and Creator Info */}
      {variant === 'detailed' && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Created: {format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm')}
          </Typography>
          {event.creator && (
            <Typography variant="caption" color="text.secondary" display="block">
              By: {event.creator.firstName} {event.creator.lastName}
            </Typography>
          )}
          {event.approvedAt && event.approver && (
            <Typography variant="caption" color="text.secondary" display="block">
              Approved: {format(new Date(event.approvedAt), 'MMM dd, yyyy HH:mm')} by {event.approver.firstName} {event.approver.lastName}
            </Typography>
          )}
          {event.rejectionReason && (
            <Typography variant="caption" color="error.main" display="block" sx={{ mt: 1 }}>
              Rejection: {event.rejectionReason}
            </Typography>
          )}
        </Box>
      )}
    </CardContent>
  );

  const cardActions = showActions && (
    <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
      <Box>
        {onView && (
          <Button
            size="small"
            startIcon={<ViewIcon />}
            onClick={() => onView(event)}
          >
            View Details
          </Button>
        )}
      </Box>

      <Box>
        {canSubmit && onSubmitForApproval && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={() => onSubmitForApproval(event)}
          >
            Submit for Approval
          </Button>
        )}
      </Box>
    </CardActions>
  );

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)',
          },
          ...(variant === 'compact' && {
            '&:hover': {
              boxShadow: 1,
              transform: 'none',
            },
          }),
        }}
      >
        {cardContent}
        {cardActions}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {canEdit && onEdit && (
          <MenuItem onClick={() => handleAction(() => onEdit(event))}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}

        {canSubmit && onSubmitForApproval && (
          <MenuItem onClick={() => handleAction(() => onSubmitForApproval(event))}>
            <SendIcon sx={{ mr: 1 }} />
            Submit for Approval
          </MenuItem>
        )}

        {canDelete && onDelete && (
          <MenuItem
            onClick={() => handleAction(() => onDelete(event))}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default EventCard;