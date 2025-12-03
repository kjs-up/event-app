import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Favorite as HealthIcon,
  AttachMoney as RevenueIcon,
  Warning as AlertIcon,
  ArrowUpward as ArrowUpIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Notifications as BellIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  CloudDownload as DownloadIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { dashboardService } from '../../services/dashboard.service';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: performanceData, isLoading: perfLoading } = useQuery({
    queryKey: ['dashboard-performance'],
    queryFn: dashboardService.getPerformance,
  });

  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['dashboard-recent-users'],
    queryFn: dashboardService.getRecentUsers,
  });

  if (statsLoading || perfLoading || usersLoading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats || !performanceData || !recentUsers) {
    return (
      <Box className="p-6">
        <Typography color="error" variant="h6">
          Error loading dashboard data. Please try again later.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      <Box className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-900 mb-2">
          Platform Administration Center
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Monitor and manage your event platform with comprehensive administrative tools
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Column */}
        <Grid item xs={12} lg={8}>
          {/* Metrics Cards */}
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="p-4 h-full flex flex-col justify-between">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="body2" color="textSecondary">Active Users</Typography>
                    <Typography variant="h5" className="font-bold my-1">{stats?.activeUsers.count.toLocaleString()}</Typography>
                    <Typography variant="caption" className="text-green-600 flex items-center">
                      <ArrowUpIcon fontSize="small" className="mr-1" /> +{stats?.activeUsers.newToday} today
                    </Typography>
                  </Box>
                  <PeopleIcon color="primary" fontSize="large" />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="p-4 h-full flex flex-col justify-between">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="body2" color="textSecondary">System Health</Typography>
                    <Typography variant="h5" className="font-bold my-1 text-green-600">{stats?.systemHealth.percentage}%</Typography>
                    <Typography variant="caption" color="textSecondary">{stats?.systemHealth.status}</Typography>
                  </Box>
                  <HealthIcon color="success" fontSize="large" />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="p-4 h-full flex flex-col justify-between">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="body2" color="textSecondary">Revenue Today</Typography>
                    <Typography variant="h5" className="font-bold my-1">${stats?.revenue.amount.toLocaleString()}</Typography>
                    <Typography variant="caption" className="text-green-600 flex items-center">
                      <ArrowUpIcon fontSize="small" className="mr-1" /> +{stats?.revenue.change}%
                    </Typography>
                  </Box>
                  <RevenueIcon className="text-yellow-500" fontSize="large" />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="p-4 h-full flex flex-col justify-between">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="body2" color="textSecondary">Active Alerts</Typography>
                    <Typography variant="h5" className="font-bold my-1 text-red-600">{stats?.activeAlerts.count}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {stats?.activeAlerts.details.length} critical
                    </Typography>
                  </Box>
                  <AlertIcon color="error" fontSize="large" />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Performance Chart */}
          <Paper className="p-6 mb-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-semibold">System Performance</Typography>
              <TextField select size="small" defaultValue="24h" variant="outlined">
                <MenuItem value="24h">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" name="CPU (%)" stroke="#4A90E2" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="memory" name="Memory (%)" stroke="#FFCE00" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="response" name="Response (s)" stroke="#D0021B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* User Management Preview */}
          <Paper className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-semibold flex items-center">
                <PeopleIcon className="mr-2 text-primary" /> User Management
              </Typography>
              <Button variant="contained" startIcon={<PeopleIcon />}>Add User</Button>
            </Box>

            <Box className="flex gap-4 mb-4">
              <TextField
                placeholder="Search users..."
                size="small"
                fullWidth
                InputProps={{ startAdornment: <SearchIcon className="text-gray-400 mr-2" /> }}
              />
              <TextField select size="small" defaultValue="all" sx={{ width: 150 }}>
                <MenuItem value="all">All Roles</MenuItem>
              </TextField>
              <TextField select size="small" defaultValue="all" sx={{ width: 150 }}>
                <MenuItem value="all">All Status</MenuItem>
              </TextField>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box className="flex items-center">
                          <Avatar className="mr-3 w-8 h-8">{user.name[0]}</Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" color={user.role === 'admin' ? 'secondary' : 'primary'} variant="outlined" />
                      </TableCell>
                      <TableCell>{user.org}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Chip label={user.status} size="small" color={user.status === 'Active' ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small"><BlockIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Box className="sticky top-6 space-y-6">
            {/* System Alerts */}
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold flex items-center">
                <BellIcon className="mr-2 text-red-500" /> System Alerts
              </Typography>
              <Box className="space-y-3">
                {stats?.activeAlerts.details.map((alert, index) => (
                  <Box key={index} className={`flex items-start p-3 rounded-lg ${alert.type === 'high' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                    <AlertIcon className={`${alert.type === 'high' ? 'text-red-500' : 'text-yellow-600'} mt-1 mr-3`} fontSize="small" />
                    <Box>
                      <Typography variant="subtitle2" className="text-gray-900">{alert.message}</Typography>
                      <Typography variant="caption" className="text-gray-500">{alert.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Quick Actions */}
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">Quick Actions</Typography>
              <Box className="space-y-2">
                <Button fullWidth variant="outlined" startIcon={<BellIcon />} className="justify-start text-gray-700">
                  Send System Broadcast
                </Button>
                <Button fullWidth variant="outlined" startIcon={<BackupIcon />} className="justify-start text-gray-700">
                  Database Backup
                </Button>
                <Button fullWidth variant="outlined" startIcon={<SecurityIcon />} className="justify-start text-gray-700">
                  Security Scan
                </Button>
                <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} className="justify-start text-gray-700">
                  Export Reports
                </Button>
              </Box>
            </Paper>

            {/* System Status */}
            <Paper className="p-6">
              <Typography variant="h6" className="mb-4 font-semibold">System Status</Typography>
              <Box className="space-y-4">
                {[
                  { label: 'API Services', status: 'Operational', color: 'bg-green-500', text: 'text-green-600' },
                  { label: 'Database', status: 'Degraded', color: 'bg-yellow-500', text: 'text-yellow-600' },
                  { label: 'Payment Gateway', status: 'Operational', color: 'bg-green-500', text: 'text-green-600' },
                  { label: 'CDN', status: 'Operational', color: 'bg-green-500', text: 'text-green-600' },
                ].map((item) => (
                  <Box key={item.label} className="flex items-center justify-between">
                    <Typography variant="body2" className="text-gray-600">{item.label}</Typography>
                    <Box className="flex items-center">
                      <Box className={`w-2 h-2 rounded-full mr-2 ${item.color}`} />
                      <Typography variant="body2" className={`font-medium ${item.text}`}>{item.status}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}