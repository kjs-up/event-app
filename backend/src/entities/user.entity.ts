import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  MAKER = 'maker',
  APPROVER = 'approver',
  ADMIN = 'admin',
}

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
@Index('idx_users_role_active', ['role', 'isActive'])
@Index('idx_users_deleted_at', ['deletedAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'citext',
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  @Exclude({ toPlainOnly: true })
  passwordHash: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  role: UserRole;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isActive: boolean;

  @Column({
    name: 'email_verified',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  emailVerified: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  @Column({
    name: 'last_login',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastLogin: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt: Date | null;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // Helper methods
  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.role);
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isApprover(): boolean {
    return this.role === UserRole.APPROVER;
  }

  isUser(): boolean {
    return this.role === UserRole.USER;
  }

  isMaker(): boolean {
    return this.role === UserRole.MAKER;
  }
}