import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CapacityUpdate {
    batchId: string;
    capacity: number;
    currentRegistrations: number;
    available: number;
}

export const useRealTimeCapacity = (batchId: string | null) => {
    const [capacity, setCapacity] = useState<CapacityUpdate | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!batchId) return;

        // Connect to the capacity namespace
        socketRef.current = io(`${SOCKET_URL}/capacity`, {
            transports: ['websocket'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to capacity gateway');
            socket.emit('joinBatch', batchId);
        });

        socket.on('capacityUpdate', (data: CapacityUpdate) => {
            if (data.batchId === batchId) {
                setCapacity(data);
            }
        });

        return () => {
            if (socket) {
                socket.emit('leaveBatch', batchId);
                socket.disconnect();
            }
        };
    }, [batchId]);

    return capacity;
};
