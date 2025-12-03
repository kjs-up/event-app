import React from 'react';
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'pending_approval':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'archived':
      return 'bg-gray-200 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
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
  const { canModifyEvent, canViewEvent, isOwner } = useRole();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const canEdit = canModifyEvent(event.createdBy, event.status);
  const canDelete = isOwner(event.createdBy) && event.status === 'draft';
  const canSubmit = isOwner(event.createdBy) && (event.status === 'draft' || event.status === 'rejected');
  const canViewDetails = canViewEvent(event.createdBy, event.status);

  if (!canViewDetails) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full ${variant === 'compact' ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{getEventTypeIcon(event.eventType)}</span>
          <h3 className={`font-medium text-gray-900 truncate ${variant === 'compact' ? 'text-sm' : 'text-lg'}`}>
            {event.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
            {getStatusLabel(event.status)}
          </span>
          {showActions && (canEdit || canDelete || canSubmit) && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <MoreVertIcon fontSize="small" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                  {canEdit && onEdit && (
                    <button
                      onClick={() => { onEdit(event); setIsMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <EditIcon fontSize="small" className="mr-2" /> Edit
                    </button>
                  )}
                  {canSubmit && onSubmitForApproval && (
                    <button
                      onClick={() => { onSubmitForApproval(event); setIsMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <SendIcon fontSize="small" className="mr-2" /> Submit
                    </button>
                  )}
                  {canDelete && onDelete && (
                    <button
                      onClick={() => { onDelete(event); setIsMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <DeleteIcon fontSize="small" className="mr-2" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {variant !== 'compact' && event.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
          {event.description}
        </p>
      )}

      {/* Details Chips */}
      <div className={`flex flex-wrap gap-2 ${variant === 'detailed' ? 'mb-4' : 'mb-2'}`}>
        <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-700 border border-gray-200" title="Event Type">
          <EventIcon fontSize="small" className="mr-1 text-gray-400" style={{ fontSize: 16 }} />
          {event.eventType}
        </div>
        <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-xs text-gray-700 border border-gray-200" title="Max Capacity">
          <PeopleIcon fontSize="small" className="mr-1 text-gray-400" style={{ fontSize: 16 }} />
          {event.maxCapacity}
        </div>
        {event.isPaid && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs text-blue-700 border border-blue-200" title="Paid Event">
            <MoneyIcon fontSize="small" className="mr-1 text-blue-400" style={{ fontSize: 16 }} />
            {event.currency} {event.basePrice}
          </div>
        )}
        {event.hasSpeakers && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-xs text-purple-700 border border-purple-200" title="Has Speakers">
            <PersonIcon fontSize="small" className="mr-1 text-purple-400" style={{ fontSize: 16 }} />
            Speakers
          </div>
        )}
      </div>

      {/* Detailed Info */}
      {variant === 'detailed' && (
        <div className="mt-auto border-t border-gray-100 pt-2 space-y-1">
          <p className="text-xs text-gray-500">
            Created: {format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm')}
          </p>
          {event.creator && (
            <p className="text-xs text-gray-500">
              By: {event.creator.firstName} {event.creator.lastName}
            </p>
          )}
          {event.approvedAt && event.approver && (
            <p className="text-xs text-gray-500">
              Approved: {format(new Date(event.approvedAt), 'MMM dd, yyyy HH:mm')} by {event.approver.firstName} {event.approver.lastName}
            </p>
          )}
          {event.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">
              Rejection: {event.rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* Actions Footer */}
      {showActions && (
        <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-100">
          <div>
            {onView && (
              <button
                onClick={() => onView(event)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center font-medium"
              >
                <ViewIcon fontSize="small" className="mr-1" /> View
              </button>
            )}
          </div>
          <div>
            {canSubmit && onSubmitForApproval && (
              <button
                onClick={() => onSubmitForApproval(event)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <SendIcon fontSize="small" className="mr-1" style={{ fontSize: 14 }} /> Submit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;