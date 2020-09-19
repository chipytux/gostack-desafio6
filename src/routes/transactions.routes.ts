import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import UploadConfig from '../config/Upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(UploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find({
    relations: ['category'],
  });
  const balance = await transactionRepository.getBalance();
  response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactions = new CreateTransactionService();
  const transactions = await createTransactions.execute({
    title,
    value: Number(value),
    type,
    category,
  });
  return response.json(transactions);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  const deleteResult = await deleteTransaction.execute(id);
  response.json(deleteResult);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute(file);
    response.json(transactions);
  },
);

export default transactionsRouter;
