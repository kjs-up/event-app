import React from 'react';
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

const performanceData = [
  { time: '00:00', cpu: 45, memory: 32, response: 1.2 },
  { time: '04:00', cpu: 38, memory: 28, response: 0.8 },
  { time: '08:00', cpu: 52, memory: 45, response: 2.1 },
  { time: '12:00', cpu: 89, memory: 67, response: 3.4 },
  { time: '16:00', cpu: 76, memory: 58, response: 2.8 },
  { time: '20:00', cpu: 63, memory: 49, response: 1.9 },
  { time: '24:00', cpu: 48, memory: 35, response: 1.1 },
];

const recentUsers = [
  { id: 1, name: 'John Smith', email: 'john@company.com', role: 'Admin', org: 'TechCorp Inc.', lastLogin: '2 hours ago', status: 'Active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@events.com', role: 'Manager', org: 'Event Solutions', lastLogin: '1 day ago', status: 'Active' },
];

export function DashboardPage() {
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
                    <Typography variant="h5" className="font-bold my-1">8,432</Typography>
                    <Typography variant="caption" className="text-green-600 flex items-center">
                      <ArrowUpIcon fontSize="small" className="mr-1" /> +12% today
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
                    <Typography variant="h5" className="font-bold my-1 text-green-600">99.8%</Typography>
                    <Typography variant="caption" color="textSecondary">All systems operational</Typography>
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
                    <Typography variant="h5" className="font-bold my-1">$45,320</Typography>
                    <Typography variant="caption" className="text-green-600 flex items-center">
                      <ArrowUpIcon fontSize="small" className="mr-1" /> +8.2%
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
                    <Typography variant="h5" className="font-bold my-1 text-red-600">3</Typography>
                    <Typography variant="caption" color="textSecondary">2 medium, 1 low</Typography>
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
                  {recentUsers.map((user) => (
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
                        <Chip label={user.role} size="small" color={user.role === 'Admin' ? 'secondary' : 'primary'} variant="outlined" />
                      </TableCell>
                      <TableCell>{user.org}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Chip label={user.status} size="small" color="success" />
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
                <Box className="flex items-start p-3 bg-red-50 rounded-lg">
                  <AlertIcon className="text-red-500 mt-1 mr-3" fontSize="small" />
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-900">High CPU Usage</Typography>
                    <Typography variant="caption" className="text-gray-600 block">Database server at 89% capacity</Typography>
                    <Typography variant="caption" className="text-gray-500">5 minutes ago</Typography>
                  </Box>
                </Box>
                <Box className="flex items-start p-3 bg-yellow-50 rounded-lg">
                  <AlertIcon className="text-yellow-600 mt-1 mr-3" fontSize="small" />
                  <Box>
                    <Typography variant="subtitle2" className="text-gray-900">Payment Gateway Latency</Typography>
                    <Typography variant="caption" className="text-gray-600 block">Response times above 2s</Typography>
                    <Typography variant="caption" className="text-gray-500">15 minutes ago</Typography>
                  </Box>
                </Box>
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