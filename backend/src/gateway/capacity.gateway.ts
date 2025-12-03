import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'capacity',
})
export class CapacityGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('CapacityGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinBatch')
    handleJoinBatch(
        @MessageBody() batchId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.join(`batch_${batchId}`);
        this.logger.log(`Client ${client.id} joined batch ${batchId}`);
        return { event: 'joined', data: batchId };
    }

    @SubscribeMessage('leaveBatch')
    handleLeaveBatch(
        @MessageBody() batchId: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(`batch_${batchId}`);
        this.logger.log(`Client ${client.id} left batch ${batchId}`);
        return { event: 'left', data: batchId };
    }

    updateCapacity(batchId: string, capacity: number, currentRegistrations: number) {
        this.server.to(`batch_${batchId}`).emit('capacityUpdate', {
            batchId,
            capacity,
            currentRegistrations,
            available: capacity - currentRegistrations,
        });
    }
}
