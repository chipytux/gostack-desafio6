import { DeleteResult, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<DeleteResult> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    try {
      const deleteResult = await transactionRepository.delete(id);
      return deleteResult;
    } catch (error) {
      throw new AppError(error, 404);
    }
  }
}

export default DeleteTransactionService;
