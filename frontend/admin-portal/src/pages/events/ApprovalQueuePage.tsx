import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { eventsService, EventApproval } from '../../services/events.service';
import { format } from 'date-fns';

import { useAuth } from '../../contexts/AuthContext';

export function ApprovalQueuePage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<EventApproval[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsService.approvals.getQueue({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        status: 'pending',
      });
      setApprovals(response.data);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch approval queue:', err);
      setError('Failed to load approval queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [paginationModel]);

  const handleReview = (id: string) => {
    navigate(`/events/approvals/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'eventProject',
      headerName: 'Event Name',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.eventProject?.name || 'N/A',
    },
    {
      field: 'submitter',
      headerName: 'Submitted By',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        const user = params.row.submitter;
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
      },
    },
    {
      field: 'createdAt',
      headerName: 'Date Submitted',
      width: 180,
      valueFormatter: (params) => {
        return params.value ? format(new Date(params.value), 'PP p') : '-';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Review">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleReview(params.row.id)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (authLoading) {
    return (
      <Box className="flex justify-center py-12">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6">
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-900">
            Approval Queue
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            Review and manage event requests waiting for approval
          </Typography>
        </Box>
        <IconButton onClick={fetchApprovals} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper className="w-full h-[600px]">
        <DataGrid
          rows={approvals}
          columns={columns}
          rowCount={total}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>
    </Box>
  );
}