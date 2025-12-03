import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Event as EventIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { eventsService } from '../../services/events.service';
import { format } from 'date-fns';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box className="p-6">
        <Typography color="error">Error loading event details.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')} className="mt-4">
          Back to Events
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending_approval': return 'warning';
      case 'rejected': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Box className="mb-6 flex justify-between items-start">
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/events')}
            className="mb-4 text-gray-600"
          >
            Back to Events
          </Button>
          <Typography variant="h4" className="font-bold text-gray-900 mb-2">
            {event.name}
          </Typography>
          <Box className="flex gap-2">
            <Chip
              label={event.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(event.status)}
              size="small"
            />
            <Chip
              icon={<CategoryIcon fontSize="small" />}
              label={event.eventType}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/events/edit/${event.id}`)}
        >
          Edit Event
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          <Paper className="p-6 mb-6">
            <Typography variant="h6" className="mb-4 font-semibold flex items-center">
              <DescriptionIcon className="mr-2 text-gray-500" /> Description
            </Typography>
            <Typography variant="body1" className="text-gray-700 whitespace-pre-wrap">
              {event.description || 'No description provided.'}
            </Typography>
          </Paper>

          <Paper className="p-6">
            <Typography variant="h6" className="mb-4 font-semibold">Details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box className="flex items-center mb-2">
                  <PeopleIcon className="mr-2 text-gray-400" />
                  <Typography variant="subtitle2" color="textSecondary">Max Capacity</Typography>
                </Box>
                <Typography variant="body1">{event.maxCapacity} attendees</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box className="flex items-center mb-2">
                  <MoneyIcon className="mr-2 text-gray-400" />
                  <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                </Box>
                <Typography variant="body1">
                  {event.isPaid ? `${event.currency} ${event.basePrice}` : 'Free'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box className="flex items-center mb-2">
                  <EventIcon className="mr-2 text-gray-400" />
                  <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                </Box>
                <Typography variant="body1">
                  {format(new Date(event.createdAt), 'PPP p')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box className="flex items-center mb-2">
                  <ScheduleIcon className="mr-2 text-gray-400" />
                  <Typography variant="subtitle2" color="textSecondary">Last Updated</Typography>
                </Box>
                <Typography variant="body1">
                  {format(new Date(event.updatedAt), 'PPP p')}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar Info */}
        <Grid item xs={12} md={4}>
          <Card className="mb-6">
            <CardContent>
              <Typography variant="h6" className="mb-4 font-semibold">Approval Status</Typography>
              {event.approvedAt ? (
                <Box className="flex items-start text-green-600">
                  <CheckCircleIcon className="mr-2 mt-1" />
                  <Box>
                    <Typography variant="subtitle1" className="font-medium">Approved</Typography>
                    <Typography variant="caption" className="text-gray-600">
                      by {event.approvedBy || 'Admin'} on {format(new Date(event.approvedAt), 'PPP')}
                    </Typography>
                  </Box>
                </Box>
              ) : event.rejectionReason ? (
                <Box className="flex items-start text-red-600">
                  <CancelIcon className="mr-2 mt-1" />
                  <Box>
                    <Typography variant="subtitle1" className="font-medium">Rejected</Typography>
                    <Typography variant="body2" className="mt-1">{event.rejectionReason}</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography color="textSecondary">Pending Approval</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4 font-semibold">Configuration</Typography>
              <Box className="space-y-3">
                <Box className="flex justify-between">
                  <Typography color="textSecondary">Has Speakers</Typography>
                  <Chip
                    label={event.hasSpeakers ? 'Yes' : 'No'}
                    size="small"
                    color={event.hasSpeakers ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Box className="flex justify-between">
                  <Typography color="textSecondary">Template</Typography>
                  <Typography variant="body2">{event.foundationTemplateId ? 'Custom Template' : 'None'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}