import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { deletedAt: null },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role, deletedAt: null, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLogin: new Date(),
    });
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.findById(id);

    await this.usersRepository.update(id, {
      isActive: false,
    });

    user.isActive = false;
    return user;
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.findById(id);

    await this.usersRepository.update(id, {
      isActive: true,
    });

    user.isActive = true;
    return user;
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);

    await this.usersRepository.softDelete(id);
  }

  async getStats(): Promise<{ total: number; newToday: number }> {
    const total = await this.usersRepository.count({
      where: { deletedAt: null },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newToday = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today })
      .getCount();

    return { total, newToday };
  }
}