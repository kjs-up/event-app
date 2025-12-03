import React, { useState } from 'react';
import { TextField, Button, Box, Alert, Typography } from '@mui/material';
import { registrationApi } from '../../services/registration.service';

interface RegistrationFormProps {
    batchId: string;
    onSuccess: (registration: any) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
    batchId,
    onSuccess,
}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const registration = await registrationApi.register(batchId, formData);
            onSuccess(registration);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Register for Event
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                margin="normal"
            />
            <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                margin="normal"
            />
            <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                margin="normal"
            />
            <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                margin="normal"
            />

            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
            >
                {loading ? 'Registering...' : 'Register Now'}
            </Button>
        </Box>
    );
};
