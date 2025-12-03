import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Container,
    Typography,
    Paper,
    Box,
    Alert,
    CircularProgress,
    Button,
} from '@mui/material';
import { eventsService } from '../../services/events.service';
import { RegistrationForm } from '../../components/registration/RegistrationForm';
import { CapacityTracker } from '../../components/events/CapacityTracker';

export const WalkInRegistration: React.FC = () => {
    const { id, batchId } = useParams<{ id: string; batchId: string }>();
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

    const batch = (event as any).batches?.find((b: any) => b.id === batchId);

    if (!batch) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">Batch not found</Alert>
            </Container>
        );
    }

    const handleReset = () => {
        setSuccess(null);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        Walk-In Registration
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {event.name} - {batch.name}
                    </Typography>
                </Box>

                <Box mb={4}>
                    <CapacityTracker
                        batchId={batch.id}
                        initialCapacity={batch.capacity}
                        initialRegistrations={batch.currentRegistrations}
                    />
                </Box>

                {success ? (
                    <Box textAlign="center" py={4}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Registration successful! Reference: <strong>{success.referenceCode}</strong>
                        </Alert>
                        <Button variant="contained" onClick={handleReset}>
                            Register Another Participant
                        </Button>
                    </Box>
                ) : (
                    <RegistrationForm
                        batchId={batch.id}
                        onSuccess={setSuccess}
                    />
                )}
            </Paper>
        </Container>
    );
};
