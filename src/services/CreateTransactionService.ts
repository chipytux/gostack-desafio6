import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('Insuficiente Funds', 400);
      }
    }

    const categoryRepository = getRepository(Category);
    let categorySaved = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!categorySaved) {
      categorySaved = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categorySaved);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categorySaved.id,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
