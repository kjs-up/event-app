import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/events/EventCard';
import { eventsService, EventProject, EventProjectListOptions } from '../../services/events.service';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../contexts/AuthContext';

type ViewMode = 'grid' | 'list';
type SortField = 'createdAt' | 'updatedAt' | 'name' | 'maxCapacity';
type SortOrder = 'ASC' | 'DESC';

const EVENT_TYPES = [
  { value: 'training', label: 'Training' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'concert', label: 'Concert' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'foundation', label: 'Foundation' },
];

const EVENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
];

export const EventList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { permissions, hasRole } = useRole();

  // State
  const [events, setEvents] = useState<EventProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filters and search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = viewMode === 'grid' ? 12 : 10;

  // Dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<EventProject | null>(null);

  // Build query options
  const queryOptions = useMemo<EventProjectListOptions>(() => {
    const options: EventProjectListOptions = {
      page,
      limit: itemsPerPage,
      sortBy,
      sortOrder,
    };

    if (search.trim()) options.search = search.trim();
    if (statusFilter) options.status = statusFilter;
    if (typeFilter) options.eventType = typeFilter;

    return options;
  }, [page, itemsPerPage, sortBy, sortOrder, search, statusFilter, typeFilter]);

  // Load events
  const loadEvents = async (options: EventProjectListOptions = queryOptions) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsService.getAll(options);

      setEvents(response.data);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / options.limit!));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and reload on filter changes
  useEffect(() => {
    loadEvents();
  }, [queryOptions]);

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    loadEvents({ ...queryOptions, page: 1 });
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEditEvent = (event: EventProject) => {
    navigate(`/events/${event.id}/edit`);
  };

  const handleViewEvent = (event: EventProject) => {
    navigate(`/events/${event.id}`);
  };

  const handleSubmitForApproval = async (event: EventProject) => {
    try {
      await eventsService.submitForApproval(event.id);
      await loadEvents(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit event for approval');
    }
  };

  const handleDeleteEvent = async (event: EventProject) => {
    setDeleteConfirm(event);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await eventsService.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      await loadEvents(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const handleRefresh = () => {
    loadEvents();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setPage(1);
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="error">Please log in to view events</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {total > 0 ? `${total} event${total !== 1 ? 's' : ''} found` : 'No events found'}
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle view">
            <IconButton
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>

          {permissions.canCreateEvents && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateEvent}
            >
              Create Event
            </Button>
          )}
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton type="submit" size="small">
                        <SearchIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {EVENT_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {EVENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                >
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="updatedAt">Updated Date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="maxCapacity">Capacity</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Box display="flex" gap={1}>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={sortOrder}
                    label="Order"
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  >
                    <MenuItem value="DESC">Desc</MenuItem>
                    <MenuItem value="ASC">Asc</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  startIcon={<FilterIcon />}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Events Grid/List */}
      {!loading && (
        <>
          {events.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {search || statusFilter || typeFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first event'}
              </Typography>
              {permissions.canCreateEvents && !search && !statusFilter && !typeFilter && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateEvent}
                >
                  Create Event
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
              {events.map((event) => (
                <Grid
                  key={event.id}
                  item
                  xs={12}
                  sm={viewMode === 'grid' ? 6 : 12}
                  md={viewMode === 'grid' ? 4 : 12}
                  lg={viewMode === 'grid' ? 3 : 12}
                >
                  <EventCard
                    event={event}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onSubmitForApproval={handleSubmitForApproval}
                    onView={handleViewEvent}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button for Mobile */}
      {permissions.canCreateEvents && (
        <Fab
          color="primary"
          aria-label="Create Event"
          onClick={handleCreateEvent}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteConfirm?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventList;