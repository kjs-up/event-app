import React from 'react';
import { useRealTimeCapacity } from '../../hooks/useRealTimeCapacity';
import { LinearProgress, Typography, Box, Chip } from '@mui/material';

interface CapacityTrackerProps {
    batchId: string;
    initialCapacity: number;
    initialRegistrations: number;
}

export const CapacityTracker: React.FC<CapacityTrackerProps> = ({
    batchId,
    initialCapacity,
    initialRegistrations,
}) => {
    const capacityData = useRealTimeCapacity(batchId);

    const capacity = capacityData?.capacity ?? initialCapacity;
    const registrations = capacityData?.currentRegistrations ?? initialRegistrations;
    const available = capacity - registrations;
    const percentage = Math.min((registrations / capacity) * 100, 100);

    const getColor = () => {
        if (percentage >= 100) return 'error';
        if (percentage >= 80) return 'warning';
        return 'success';
    };

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Capacity: {registrations} / {capacity}
                </Typography>
                <Chip
                    label={available > 0 ? `${available} Available` : 'Sold Out'}
                    color={getColor()}
                    size="small"
                />
            </Box>
            <LinearProgress
                variant="determinate"
                value={percentage}
                color={getColor()}
                sx={{ height: 8, borderRadius: 4 }}
            />
        </Box>
    );
};
