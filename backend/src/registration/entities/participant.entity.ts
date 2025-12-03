import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Registration } from '@/registration/entities/registration.entity';
import { User } from '../../users/entities/user.entity';

@Entity('participants')
export class Participant {
    @ApiProperty({ description: 'Participant UUID' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'User ID (if registered user)' })
    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @ApiProperty({ description: 'First Name' })
    @Column()
    firstName: string;

    @ApiProperty({ description: 'Last Name' })
    @Column()
    lastName: string;

    @ApiProperty({ description: 'Email' })
    @Column()
    email: string;

    @ApiProperty({ description: 'Phone Number' })
    @Column({ nullable: true })
    phoneNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Registration, (registration) => registration.participant)
    registrations: Registration[];
}
