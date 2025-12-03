import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { eventsService } from '../../services/events.service';
import { CapacityTracker } from '../../components/events/CapacityTracker';
import { RegistrationForm } from '../../components/registration/RegistrationForm';

export const EventRegistration: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [success, setSuccess] = useState<any>(null);

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', id],
        queryFn: () => eventsService.getById(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !event) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">Failed to load event details</Alert>
            </Container>
        );
    }

    const batches = (event as any).batches || [];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {event.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" paragraph>
                    {event.description}
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Available Sessions
                    </Typography>

                    {batches.length === 0 ? (
                        <Alert severity="info">No sessions available for registration yet.</Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {batches.map((batch: any) => (
                                <Grid item xs={12} md={6} key={batch.id}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Typography variant="h6">{batch.name}</Typography>
                                                <Chip
                                                    label={batch.isAvailable ? 'Open' : 'Closed'}
                                                    color={batch.isAvailable ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </Box>

                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(batch.startTime).toLocaleString()} - {new Date(batch.endTime).toLocaleString()}
                                            </Typography>

                                            <CapacityTracker
                                                batchId={batch.id}
                                                initialCapacity={batch.capacity}
                                                initialRegistrations={batch.currentRegistrations}
                                            />

                                            {success?.eventBatchId === batch.id ? (
                                                <Alert severity="success" sx={{ mt: 2 }}>
                                                    Registration confirmed! Reference: {success.referenceCode}
                                                </Alert>
                                            ) : (
                                                batch.isAvailable && (
                                                    <RegistrationForm
                                                        batchId={batch.id}
                                                        onSuccess={setSuccess}
                                                    />
                                                )
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};
