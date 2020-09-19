import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (acumulator, transaction) => {
        const localAcumulator = acumulator;
        switch (transaction.type) {
          case 'income':
            localAcumulator.income += transaction.value;
            break;
          case 'outcome':
            localAcumulator.outcome += transaction.value;
            break;
          default:
            break;
        }
        return acumulator;
      },
      { income: 0, outcome: 0 },
    );

    const total = balance.income - balance.outcome;
    return { total, ...balance };
  }
}

export default TransactionsRepository;
