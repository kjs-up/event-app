
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { EventApproval } from './src/events/entities/event-approval.entity';
import { EventProject } from './src/events/entities/event-project.entity';
import { User } from './src/users/entities/user.entity';
import { FoundationTemplate } from './src/events/entities/foundation-template.entity';

config({ path: join(process.cwd(), '.env') });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'eventuser',
    password: process.env.DATABASE_PASSWORD || 'eventpass',
    database: process.env.DATABASE_NAME || 'eventdb',
    schema: process.env.DATABASE_SCHEMA || 'public',
    entities: [EventApproval, EventProject, User, FoundationTemplate],
    ssl: false,
});

async function testQuery() {
    try {
        await AppDataSource.initialize();
        console.log('Connected to DB');

        const repo = AppDataSource.getRepository(EventApproval);
        const qb = repo.createQueryBuilder('approval');
        const results = await qb.getMany();

        console.log('Query successful. Count:', results.length);
        if (results.length > 0) {
            console.log('First item:', results[0]);
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

testQuery();
