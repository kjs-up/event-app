import { api } from './api';

export interface Participant {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
}

export interface Registration {
    id: string;
    participantId: string;
    eventBatchId: string;
    status: string;
    referenceCode: string;
    checkedInAt?: string;
    participant?: Participant;
}

export const registrationApi = {
    register: async (batchId: string, data: Partial<Participant>): Promise<Registration> => {
        const response = await api.post(`/registration/batch/${batchId}`, data);
        return response;
    },

    getByReference: async (code: string): Promise<Registration> => {
        const response = await api.get(`/registration/reference/${code}`);
        return response;
    },
};
