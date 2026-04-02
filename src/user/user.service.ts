import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Check if user with same email already exists
    const existingEmailUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingEmailUser) {
      throw new Error(`User with email '${userData.email}' already exists`);
    }

    // Check if user with same mobile number already exists (if mobile number is provided)
    if (userData.mobileNumber) {
      const existingMobileUser = await this.userRepository.findOne({
        where: { mobileNumber: userData.mobileNumber }
      });

      if (existingMobileUser) {
        throw new Error(`User with mobile number '${userData.mobileNumber}' already exists`);
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async findAllNonAdminUsers(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: UserRole.USER },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    // Check if updating email would cause duplicate
    if (userData.email) {
      const existingEmailUser = await this.userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingEmailUser && existingEmailUser.id !== id) {
        throw new Error(`User with email '${userData.email}' already exists`);
      }
    }

    // Check if updating mobile number would cause duplicate
    if (userData.mobileNumber) {
      const existingMobileUser = await this.userRepository.findOne({
        where: { mobileNumber: userData.mobileNumber }
      });

      if (existingMobileUser && existingMobileUser.id !== id) {
        throw new Error(`User with mobile number '${userData.mobileNumber}' already exists`);
      }
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    await this.userRepository.update(id, userData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
