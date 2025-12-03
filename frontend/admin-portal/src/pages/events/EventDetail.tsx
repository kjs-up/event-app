import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import { eventsService } from '../../services/events.service';
import { RegistrationList } from '../../components/registration/RegistrationList';
import { CapacityTracker } from '../../components/events/CapacityTracker';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [tabValue, setTabValue] = useState(0);

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', id],
        queryFn: () => eventsService.getById(id!),
        enabled: !!id,
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !event) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Failed to load event details</Alert>
            </Container>
        );
    }

    const batches = (event as any).batches || [];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {event.name}
                        </Typography>
                        <Chip
                            label={event.status}
                            color={event.status === 'approved' ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>
                    <Button
                        variant="contained"
                        component={Link}
                        to={`/events/${id}/edit`}
                    >
                        Edit Event
                    </Button>
                </Box>

                <Typography variant="subtitle1" color="text.secondary" paragraph>
                    {event.description}
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                        <Typography variant="body1">{event.eventType}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">Max Capacity</Typography>
                        <Typography variant="body1">{event.maxCapacity}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="event tabs">
                        <Tab label="Sessions & Batches" />
                        <Tab label="Registrations" />
                    </Tabs>
                </Box>
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        {batches.map((batch: any) => (
                            <Grid item xs={12} md={6} key={batch.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="h6">{batch.name}</Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                component={Link}
                                                to={`/events/${id}/batches/${batch.id}/walk-in`}
                                            >
                                                Walk-In Register
                                            </Button>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {new Date(batch.startTime).toLocaleString()} - {new Date(batch.endTime).toLocaleString()}
                                        </Typography>

                                        <CapacityTracker
                                            batchId={batch.id}
                                            initialCapacity={batch.capacity}
                                            initialRegistrations={batch.currentRegistrations}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {batches.length === 0 && (
                            <Grid item xs={12}>
                                <Alert severity="info">No sessions created yet.</Alert>
                            </Grid>
                        )}
                    </Grid>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    {/* Placeholder for fetching all registrations across batches */}
                    {/* In a real app, we would fetch registrations for the event here */}
                    <Alert severity="info">Select a specific session to view registrations.</Alert>
                </TabPanel>
            </Paper>
        </Container>
    );
};
