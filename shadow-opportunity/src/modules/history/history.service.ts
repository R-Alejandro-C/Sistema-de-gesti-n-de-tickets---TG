import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';

@Injectable()
export class HistoryService {
    constructor(
        @InjectRepository(History)
        private historyRepository: Repository<History>,
    ) { }

    async createEntry(data: Partial<History>) {
        const entry = this.historyRepository.create(data);
        return this.historyRepository.save(entry);
    }
}
