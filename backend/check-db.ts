
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'eventuser',
    password: process.env.DATABASE_PASSWORD || 'eventpass',
    database: process.env.DATABASE_NAME || 'eventdb',
    schema: process.env.DATABASE_SCHEMA || 'public',
    ssl: false,
});

async function checkColumns() {
    try {
        await AppDataSource.initialize();
        console.log('Connected to DB');
        const runner = AppDataSource.createQueryRunner();
        const table = await runner.getTable('event_approvals');
        if (table) {
            console.log('Columns in event_approvals:', table.columns.map(c => c.name));
        } else {
            console.log('Table event_approvals not found');
        }
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkColumns();
