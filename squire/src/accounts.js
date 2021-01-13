const { Op, QueryTypes } = require("sequelize");
const fee = 0.0;

exports.getAccountTransactions = getAccountTransactions;
exports.deposit = deposit;
exports.withdraw = withdraw;
exports.getAccount = getAccount;
exports.listAccounts = listAccounts;
exports.getTransaction = getTransaction;
exports.listTransactions = listTransactions;
exports.createTransaction = createTransaction;
exports.commitTransaction = commitTransaction;

async function getAccount(store, id) {
  try {
    account = await store.models.Account.findOne({ where: { uuid: id } });
    return account;
  } catch (error) {
    console.log(error.message);
  }
}

async function listAccounts(store, query) {
  try {
    accounts = await store.models.Account.findAll({ where: query });
    return accounts;
  } catch (error) {
    console.log(error.message);
  }
}

async function getTransaction(store, id) {
  try {
    transaction = await store.models.Transaction.findOne({
      where: { uuid: id },
    });
    return transaction;
  } catch (error) {
    console.log(error.message);
  }
}

async function listTransactions(store, query) {
  try {
    transactions = await store.models.Transaction.findAll({ where: query });
    return transactions;
  } catch (error) {
    console.log(error.message);
  }
}

async function createTransaction(store, request) {
  try {
    var payment, refund, charge, barber;
    if (
      typeof request.sourceAccountId !== "undefined" &&
      typeof request.destinationAccountId !== "undefined" &&
      request.sourceAccountId === request.destinationAccountId
    ) {
      throw new Error("invalid destination account");
    }

    // sourceAccount = await store.models.Account.findOne({
    //   where: { uuid: request.sourceAccountId },
    // });
    // destinationAccount = await store.models.Account.findOne({
    //   where: { uuid: request.destinationAccountId },
    // });

    if (request.type == "deposit") {
      let amount = request.amount;
      if (amount <= 0) {
        throw new Error("invaid amount");
      }

      destinationAccount = await store.models.Account.findOne({
        where: { uuid: request.destinationAccountId },
      });

      transaction = await store.models.Transaction.create({
        type: request.type,
        description: request.type,
        amount: amount,
        DestinationAccountUuid: destinationAccount.get("uuid"),
      });

      await commitTransaction(store, transaction.get("uuid"));
      return;
    }

    if (request.type == "withdrawal") {
      sourceAccount = await store.models.Account.findOne({
        where: { uuid: request.sourceAccountId },
      });
      availableBalance = parseFloat(sourceAccount.get("availableBalance"));
      balance = parseFloat(sourceAccount.get("balance"));
      amount = request.amount;
      if (amount > availableBalance || amount > balance) {
        throw new Error("insufficient funds");
      }

      transaction = await store.models.Transaction.create({
        type: request.type,
        description: request.type,
        amount: amount,
        SourceAccountUuid: sourceAccount.get("uuid"),
      });

      await commitTransaction(store, transaction.get("uuid"));
      return;
    }

    if (request.type == "payment") {
      payment = await store.models.Payment.findOne({
        where: { uuid: request.paymentId },
      });

      let amount = parseFloat(payment.get("amount"));
      if (amount <= 0) {
        throw new Error("invaid amount");
      }

      charge = await store.models.Charge.findOne({
        where: { uuid: payment.get("ChargeUuid") },
      });

      barber = await store.models.User.findOne({
        where: { uuid: charge.get("BarberUuid") },
      });

      customer = await payment.getCustomer();
      merchant = await payment.getMerchant();

      barberAccount = await barber.getAccount();

      customerAccount = await customer.getAccount();
      merchantAccount = await merchant.getAccount();

      availableBalance = parseFloat(customerAccount.get("availableBalance"));
      balance = parseFloat(customerAccount.get("balance"));
      tipAmount = parseFloat(charge.get("tipAmount"));
      feeAmount = amount * fee;

      if (amount > availableBalance || amount > balance) {
        throw new Error("insufficient funds");
      }

      merchantTransaction = await store.models.Transaction.create({
        type: request.type,
        description: request.type,
        amount: amount,
        feeAmount: feeAmount,
        SourceAccountUuid: customerAccount.get("uuid"),
        DestinationAccountUuid: merchantAccount.get("uuid"),
        PaymentUuid: payment.get("uuid"),
      });

      tipTransaction = await store.models.Transaction.create({
        type: request.type,
        description: request.type,
        amount: tipAmount,
        SourceAccountUuid: merchantAccount.get("uuid"),
        DestinationAccountUuid: barberAccount.get("uuid"),
      });

      await commitTransaction(store, merchantTransaction.get("uuid"));
      await commitTransaction(store, tipTransaction.get("uuid"));

      await store.models.Payment.update(
        { status: "completed" },
        { where: { uuid: payment.get("uuid") } }
      );
      return;
    }

    if (request.type == "refund") {
      refund = await store.models.Refund.findOne({
        where: { uuid: request.refundId },
      });
      payment = await refund.getPayment();
      charge = await refund.getCharge();
      barber = await charge.getBarber();

      customer = await refund.getCustomer();

      merchant = await payment.getMerchant();

      merchantAccount = await merchant.getAccount();
      barberAccount = await barber.getAccount();
      customerAccount = await customer.getAccount();
      feeAccount = await store.models.Account.findOne({
        where: { type: "fee" },
      });
      suspenseAccount = await store.models.Account.findOne({
        where: { type: "suspense" },
      });

      tipAmount = parseFloat(charge.get("tipAmount"));
      total = parseFloat(payment.get("amount"));
      feeAmount = total * fee;
      amount = total - feeAmount;

      merchantAvailableBalance = parseFloat(
        merchantAccount.get("availableBalance")
      );
      barberAvailableBalance = parseFloat(
        barberAccount.get("availableBalance")
      );

      feeAvailableBalance = parseFloat(feeAccount.get("availableBalance"));

      merchantBalance = parseFloat(merchantAccount.get("balance"));
      barberBalance = parseFloat(barberAccount.get("balance"));
      feeBalance = parseFloat(feeAccount.get("balance"));
      // refundAmount = parseFloat(refund.get("amount"));
      refundAmount = amount + feeAmount;

      if (
        amount - tipAmount > merchantAvailableBalance ||
        amount - tipAmount > merchantBalance
      ) {
        throw new Error("insufficient merchant funds");
      }
      if (tipAmount > barberAvailableBalance || tipAmount > barberBalance) {
        throw new Error("insufficient barber funds");
      }
      if (feeAmount > feeAvailableBalance || feeAmount > feeBalance) {
        throw new Error("insufficient fee funds");
      }

      merchantTransaction = await store.models.Transaction.create({
        type: request.type,
        description: request.type,
        amount: amount - tipAmount,
        SourceAccountUuid: merchantAccount.get("uuid"),
        DestinationAccountUuid: suspenseAccount.get("uuid"),
      });
      await commitTransaction(store, merchantTransaction.get("uuid"));

      if (tipAmount > 0) {
        barberTransaction = await store.models.Transaction.create({
          type: request.type,
          description: request.type,
          amount: tipAmount,
          SourceAccountUuid: barberAccount.get("uuid"),
          DestinationAccountUuid: suspenseAccount.get("uuid"),
        });
        await commitTransaction(store, barberTransaction.get("uuid"));
      }

      if (feeAmount > 0) {
        feeTransaction = await store.models.Transaction.create({
          type: request.type,
          description: request.type,
          amount: feeAmount,
          SourceAccountUuid: feeAccount.get("uuid"),
          DestinationAccountUuid: suspenseAccount.get("uuid"),
        });
        await commitTransaction(store, feeTransaction.get("uuid"));
      }

      refundTransaction = await store.models.Transaction.create({
        type: request.type,
        description: request.type,
        amount: refundAmount,
        SourceAccountUuid: suspenseAccount.get("uuid"),
        DestinationAccountUuid: customerAccount.get("uuid"),
        RefundUuid: refund.get("uuid"),
      });
      await commitTransaction(store, refundTransaction.get("uuid"));

      await store.models.Refund.update(
        { status: "completed" },
        { where: { uuid: refund.get("uuid") } }
      );
      return;
    }

    if (request.type == "transfer") {
      amount = request.amount;
      if (amount <= 0) {
        throw new Error("invaid amount");
      }

      sourceAccount = await store.models.Account.findOne({
        where: { uuid: request.sourceAccountId },
      });

      destinationAccount = await store.models.Account.findOne({
        where: { uuid: request.destinationAccountId },
      });

      availableBalance = parseFloat(sourceAccount.get("availableBalance"));
      balance = parseFloat(sourceAccount.get("balance"));

      if (amount > availableBalance || amount > balance) {
        throw new Error("insufficient funds");
      }

      transaction = await store.models.Transaction.create({
        type: request.type,
        description: request.type,
        amount: amount,
        SourceAccountUuid: sourceAccount.get("uuid"),
        DestinationAccountUuid: destinationAccount.get("uuid"),
      });
      await commitTransaction(store, transaction.get("uuid"));

      return;
    }

    throw new Error(`invalid transaction type ${request.type}`);
  } catch (error) {
    console.log(error.message);
  }
}

async function deposit(store, id, amount) {
  try {
    account = await store.models.Account.findOne({ where: { uuid: id } });
    await account.increment({
      balance: amount,
      availableBalance: amount,
    });
    account = await store.models.Account.findOne({ where: { uuid: id } });
    return account;
  } catch (error) {
    console.log(error.message);
  }
}

async function withdraw(store, id, amount) {
  try {
    account = await store.models.Account.findOne({ where: { uuid: id } });
    availableBalance = parseFloat(account.get("availableBalance"));
    balance = parseFloat(account.get("balance"));
    if (amount > availableBalance || amount > balance) {
      throw new Error("insufficient funds");
    }
    await store.query(
      'UPDATE "Accounts" SET "availableBalance" = "availableBalance" - ?, "balance" = "balance" - ? WHERE "uuid" = ? and "availableBalance" >= ? and "availableBalance" >= "balance"',
      {
        replacements: [amount, amount, id, amount],
        type: QueryTypes.UPDATE,
      }
    );

    account = await store.models.Account.findOne({ where: { uuid: id } });
    return account;
  } catch (error) {
    console.log(error.message);
  }
}

async function debitAccount(store, id, amount) {
  try {
    if (amount <= 0) {
      throw new Error("invalid amount");
    }
    account = await store.models.Account.findOne({ where: { uuid: id } });
    availableBalance = parseFloat(account.get("availableBalance"));
    balance = parseFloat(account.get("balance"));
    if (amount > availableBalance || amount > balance) {
      throw new Error("insufficient funds");
    }
    await store.query(
      'UPDATE "Accounts" SET "availableBalance" = "availableBalance" - ? WHERE "uuid" = ? and "availableBalance" >= ? and "balance" >= ?',
      {
        replacements: [amount, id, amount, amount],
        type: QueryTypes.UPDATE,
      }
    );

    account = await store.models.Account.findOne({ where: { uuid: id } });
    return account;
  } catch (error) {
    console.log(error.message);
  }
}

async function creditAccount(store, id, amount) {
  try {
    account = await store.models.Account.findOne({ where: { uuid: id } });
    if (amount <= 0) {
      throw new Error("invalid amount");
    }
    await store.query(
      'UPDATE "Accounts" SET "balance" = "balance" + ? WHERE "uuid" = ?',
      {
        replacements: [amount, id],
        type: QueryTypes.UPDATE,
      }
    );

    account = await store.models.Account.findOne({ where: { uuid: id } });
    return account;
  } catch (error) {
    console.log(error.message);
  }
}

async function completeDebit(store, id, amount) {
  try {
    if (amount <= 0) {
      throw new Error("invalid amount");
    }
    account = await store.models.Account.findOne({ where: { uuid: id } });
    balance = parseFloat(account.get("balance"));
    if (amount > balance) {
      throw new Error("insufficient funds");
    }
    await store.query(
      'UPDATE "Accounts" SET "balance" = "balance" - ? WHERE "uuid" = ? and "balance" >= ?',
      {
        replacements: [amount, id, amount],
        type: QueryTypes.UPDATE,
      }
    );

    account = await store.models.Account.findOne({ where: { uuid: id } });
    return account;
  } catch (error) {
    console.log(error.message);
  }
}

async function completeCredit(store, id, amount) {
  try {
    account = await store.models.Account.findOne({ where: { uuid: id } });
    if (amount <= 0) {
      throw new Error("invalid amount");
    }
    await store.query(
      'UPDATE "Accounts" SET "availableBalance" = "availableBalance" + ? WHERE "uuid" = ?',
      {
        replacements: [amount, id],
        type: QueryTypes.UPDATE,
      }
    );

    account = await store.models.Account.findOne({ where: { uuid: id } });
    return account;
  } catch (error) {
    console.log(error.message);
  }
}

async function commitTransaction(store, transactionID) {
  try {
    transaction = await store.models.Transaction.findOne({
      where: { uuid: transactionID },
    });

    if (transaction.get("status") !== "pending") {
      throw new Error("transaction is already complete");
    }

    sourceId = transaction.get("SourceAccountUuid");
    destinationId = transaction.get("DestinationAccountUuid");
    if (
      typeof sourceAccountId !== "undefined" &&
      typeof destinationAccountId !== "undefined" &&
      sourceAccountId === destinationAccountId
    ) {
      throw new Error("invalid destination");
    }

    amount = parseFloat(transaction.get("amount"));
    feeAmount = parseFloat(transaction.get("feeAmount"));

    if (amount <= 0) {
      transaction = await store.models.Transaction.update(
        { status: "error", errorDescription: "invalid amount" },
        { where: { uuid: transactionID } }
      );
      throw new Error("invalid amount");
    }

    if (feeAmount < 0) {
      transaction = await store.models.Transaction.update(
        { status: "error", errorDescription: "invalid fee amount" },
        { where: { uuid: transactionID } }
      );
      throw new Error("invalid fee amount");
    }

    if (transaction.get("type") === "deposit") {
      return await deposit(store, destinationId, amount);
    }

    if (transaction.get("type") === "withdrawal") {
      return await withdraw(store, sourceId, amount);
    }

    // if (transaction.get("type") !== "payment" &&   feeAmount <= 0) {
    //   transaction = await store.models.Transaction.update(
    //     { feeAmount: amount * fee },
    //     { where: { uuid: transactionID } }
    //   );
    //   feeAmount = parseFloat(transaction.get("feeAmount"));
    // }

    total = amount + feeAmount;

    sourceAccount = await store.models.Account.findOne({
      where: { uuid: sourceId },
    });

    destinationAccount = await store.models.Account.findOne({
      where: { uuid: destinationId },
    });

    feeAccount = await store.models.Account.findOne({
      where: { type: "fee" },
    });

    availableBalance = parseFloat(sourceAccount.get("availableBalance"));
    balance = parseFloat(sourceAccount.get("balance"));
    if (total > availableBalance || total > balance) {
      transaction = await store.models.Transaction.update(
        { status: "error", errorDescription: "insufficient funds" },
        { where: { uuid: transactionID } }
      );
      throw new Error("insufficient funds");
    }

    sourceAccount = await debitAccount(store, sourceId, total);
    destinationAccount = await creditAccount(store, destinationId, amount);
    sourceAccount = await completeDebit(store, sourceId, total);
    destinationAccount = await completeCredit(store, destinationId, amount);

    if (feeAmount > 0) {
      feeAccount = await creditAccount(
        store,
        feeAccount.get("uuid"),
        feeAmount
      );
      feeAccount = await completeCredit(
        store,
        feeAccount.get("uuid"),
        feeAmount
      );
    }

    await store.models.Transaction.update(
      { status: "completed" },
      { where: { uuid: transactionID } }
    );

    return { source: sourceAccount, destination: destinationAccount };
  } catch (error) {
    console.log(error.message);
  }
}

async function getAccountTransactions(store, id) {
  try {
    transactions = await store.models.Transaction.findAll({
      where: {
        [Op.or]: [{ SourceAccountUuid: id }, { DestinationAccountUuid: id }],
      },
    });
    return transactions;
  } catch (error) {
    console.log(error.message);
  }
}
