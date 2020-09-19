import neatCsv from 'neat-csv';
import fs from 'fs';
import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface MapHeaders {
  header: string;
}

interface MapValues {
  value: string;
}

class ImportTransactionsService {
  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    if (file.mimetype !== 'text/csv') {
      throw new AppError('File must be a CSV');
    }

    const csvFileString = await fs.promises.readFile(file.path);
    await fs.promises.unlink(file.path);
    const csvParsed = await neatCsv(csvFileString, {
      mapValues: ({ value }: MapValues): string => value.trim(),
      mapHeaders: ({ header }: MapHeaders): string => header.trim(),
    });

    const categoryRepository = getRepository(Category);

    const PromisesListObjectWithCategoryID = csvParsed.map(
      async transaction => {
        const transactionLocal = transaction;
        let category = await categoryRepository.findOne({
          where: { title: transaction.category },
        });

        if (!category) {
          category = categoryRepository.create({
            title: transaction.category,
          });
          await categoryRepository.save(category);
        }
        const { id: category_id } = category;

        delete transactionLocal.category;
        return { ...transactionLocal, category_id };
      },
    );

    const transactionsList = await Promise.all(
      PromisesListObjectWithCategoryID,
    );
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transactions = transactionRepository.create(transactionsList);
    await transactionRepository.save(transactions);
    return transactions;
  }
}

export default ImportTransactionsService;
