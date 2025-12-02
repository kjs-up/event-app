import { MigrationInterface, QueryRunner } from "typeorm";

export class v3__seed_event_data_2025120200003 implements MigrationInterface {
    name = 'v3__seed_event_data_2025120200003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Seed Foundation Templates
        await queryRunner.query(`
            INSERT INTO foundation_templates (id, name, description, event_type, default_capacity, default_is_paid, default_price, default_has_speakers, is_active)
            VALUES 
            ('f1000000-0000-0000-0000-000000000001', 'Standard Concert', 'Template for standard concert events', 'concert', 500, true, 50.00, true, true),
            ('f1000000-0000-0000-0000-000000000002', 'Charity Gala', 'Template for charity gala events', 'foundation', 200, true, 100.00, true, true)
            ON CONFLICT (id) DO NOTHING;
        `);

        // Get user IDs (assuming they exist from previous migration)
        const users = await queryRunner.query(`SELECT id, email FROM users WHERE email IN ('user@eventplatform.com', 'approver@eventplatform.com')`);
        const maker = users.find((u: any) => u.email === 'user@eventplatform.com');
        const approver = users.find((u: any) => u.email === 'approver@eventplatform.com');

        if (maker && approver) {
            // 2. Seed Event Projects
            await queryRunner.query(`
                INSERT INTO event_projects (id, name, description, event_type, foundation_template_id, max_capacity, is_paid, base_price, has_speakers, status, created_by, approved_by, approved_at)
                VALUES 
                ('e1000000-0000-0000-0000-000000000001', 'Summer Rock Fest', 'Annual summer rock festival', 'concert', 'f1000000-0000-0000-0000-000000000001', 1000, true, 75.00, true, 'draft', '${maker.id}', NULL, NULL),
                ('e1000000-0000-0000-0000-000000000002', 'Tech Talk 2025', 'Future of technology seminar', 'seminar', NULL, 100, false, NULL, true, 'pending_approval', '${maker.id}', NULL, NULL),
                ('e1000000-0000-0000-0000-000000000003', 'Annual Charity Ball', 'Fundraising event for local shelter', 'foundation', 'f1000000-0000-0000-0000-000000000002', 300, true, 150.00, true, 'approved', '${maker.id}', '${approver.id}', NOW())
                ON CONFLICT (id) DO NOTHING;
            `);

            // 3. Seed Event Approvals
            await queryRunner.query(`
                INSERT INTO event_approvals (id, event_project_id, approver_id, submitted_by, status, action, comments)
                VALUES 
                ('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', '${approver.id}', '${maker.id}', 'pending', 'approve', 'Looks good, pending final review'),
                ('a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000003', '${approver.id}', '${maker.id}', 'approved', 'approve', 'Approved for launch')
                ON CONFLICT (id) DO NOTHING;
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete in reverse order of dependencies
        await queryRunner.query(`DELETE FROM event_approvals WHERE id IN ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002')`);
        await queryRunner.query(`DELETE FROM event_projects WHERE id IN ('e1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000003')`);
        await queryRunner.query(`DELETE FROM foundation_templates WHERE id IN ('f1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002')`);
    }

}
