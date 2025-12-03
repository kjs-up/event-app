import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box,
} from '@mui/material';

interface Registration {
    id: string;
    referenceCode: string;
    status: string;
    checkedInAt?: string;
    participant: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface RegistrationListProps {
    registrations: Registration[];
}

export const RegistrationList: React.FC<RegistrationListProps> = ({ registrations }) => {
    if (!registrations || registrations.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No registrations found.</Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Reference</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Check-in</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {registrations.map((reg) => (
                        <TableRow key={reg.id}>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {reg.referenceCode}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {reg.participant.firstName} {reg.participant.lastName}
                            </TableCell>
                            <TableCell>{reg.participant.email}</TableCell>
                            <TableCell>
                                <Chip
                                    label={reg.status}
                                    color={reg.status === 'CONFIRMED' ? 'success' : 'default'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                {reg.checkedInAt ? (
                                    new Date(reg.checkedInAt).toLocaleString()
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        Not checked in
                                    </Typography>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
