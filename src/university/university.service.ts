import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { University } from './university.entity';

@Injectable()
export class UniversityService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
  ) {}

  async create(universityData: any): Promise<any> {
    // Check if university with same name and country already exists
    const existingUniversity = await this.universityRepository.findOne({
      where: { 
        name: universityData.name, 
        country: universityData.country 
      }
    });

    if (existingUniversity) {
      throw new Error(`University '${universityData.name}' in '${universityData.country}' already exists`);
    }

    const university = this.universityRepository.create(universityData);
    const savedUniversity = await this.universityRepository.save(university);
    return savedUniversity;
  }

  async findAll(): Promise<University[]> {
    return await this.universityRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<University | undefined> {
    return await this.universityRepository.findOne({ 
      where: { id } 
    });
  }

  async findByCountry(country: string): Promise<University[]> {
    return await this.universityRepository.find({
      where: { country },
      order: { name: 'ASC' },
    });
  }

  async searchUniversities(searchTerm: string): Promise<University[]> {
    return await this.universityRepository
      .createQueryBuilder('university')
      .where('university.name ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('university.country ILIKE :search', { search: `%${searchTerm}%` })
      .orderBy('university.name', 'ASC')
      .getMany();
  }

  async update(id: string, universityData: any): Promise<University | null> {
    // Check if updating name/country would cause duplicate
    if (universityData.name || universityData.country) {
      const existingUniversity = await this.universityRepository.findOne({
        where: { 
          name: universityData.name, 
          country: universityData.country 
        }
      });

      if (existingUniversity && existingUniversity.id !== id) {
        throw new Error(`University '${universityData.name}' in '${universityData.country}' already exists`);
      }
    }

    await this.universityRepository.update(id, universityData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.universityRepository.delete(id);
    return result.affected > 0;
  }

  async getUniversityStats(): Promise<any> {
    const universities = await this.findAll();
    const countries = [...new Set(universities.map(uni => uni.country))];
    
    return {
      totalUniversities: universities.length,
      totalCountries: countries.length,
      countries: countries,
      universitiesByCountry: countries.map(country => ({
        country,
        count: universities.filter(uni => uni.country === country).length
      }))
    };
  }
}
