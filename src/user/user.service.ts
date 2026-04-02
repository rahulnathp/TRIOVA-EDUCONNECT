import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
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
    return await this.userRepository.find();
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
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
