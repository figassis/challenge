const { Sequelize } = require("sequelize");
const {
  signupMerchant,
  getMerchant,
  listMerchants,
  addEmployee,
} = require("./merchants");

const {
  getAccountTransactions,
  deposit,
  withdraw,
  commitTransaction,
  getAccount,
  listAccounts,
  getTransaction,
  listTransactions,
  createTransaction,
} = require("./accounts");

const {
  chargeUser,
  createPayment,
  createRefund,
  getCharge,
  listCharges,
  getPayment,
  listPayments,
  getRefund,
  listRefunds,
} = require("./charges");

const { signupUser, getUser, listUsers } = require("./users");
const defineAccount = require("./models/account");
const defineAssociations = require("./models/associations");
const defineCharge = require("./models/charge");
const defineMerchant = require("./models/merchant");
const definePayment = require("./models/payment");
const defineRefund = require("./models/refund");
const defineTransaction = require("./models/transaction");
const defineUser = require("./models/user");

class Squire {
  constructor() {
    return (async () => {
      this.store = await initialize(process.env.RESET === "true");
      // this.fee = parseFloat(process.env.FEE);
      return this;
    })();
  }

  // Merchants
  async signupMerchant(user, merchantName) {
    return await signupMerchant(this.store, user, merchantName);
  }
  async getMerchant(id) {
    return await getMerchant(this.store, id);
  }
  async listMerchants(query) {
    return await listMerchants(this.store, query);
  }

  async addEmployee(merchantId, user) {
    return await addEmployee(this.store, merchantId, user);
  }

  // Users
  async signupUser(user) {
    return await signupUser(this.store, user);
  }
  async getUser(id) {
    return await getUser(this.store, id);
  }
  async listUsers(query) {
    return await listUsers(this.store, query);
  }

  // Accounts
  async getAccount(id) {
    return await getAccount(this.store, id);
  }

  async listAccounts(query) {
    return await listAccounts(this.store, query);
  }

  async getAccountTransactions(id) {
    return await getAccountTransactions(this.store, id);
  }
  async deposit(id, amount) {
    return await deposit(this.store, id, amount);
  }
  async withdraw(id, amount) {
    return await withdraw(this.store, id, amount);
  }

  //Transactions
  async getTransaction(id) {
    return await getTransaction(this.store, id);
  }

  async listTransactions(query) {
    return await listTransactions(this.store, query);
  }

  async createTransaction(request) {
    return await createTransaction(this.store, request);
  }

  async commitTransaction(id) {
    return await commitTransaction(this.store, id);
  }

  // Payments
  async listCharges(query) {
    return await listCharges(this.store, query);
  }
  async listPayments(query) {
    return await listPayments(this.store, query);
  }
  async listRefunds(query) {
    return await listRefunds(this.store, query);
  }

  async getCharge(id) {
    return await getCharge(this.store, id);
  }

  async getPayment(id) {
    return await getPayment(this.store, id);
  }

  async getRefund(id) {
    return await getRefund(this.store, id);
  }

  async chargeUser(customerId, barberId, amount, tipAmount) {
    return await chargeUser(
      this.store,
      customerId,
      barberId,
      amount,
      tipAmount
    );
  }

  async createPayment(id) {
    return await createPayment(this.store, id);
  }

  async createRefund(id) {
    return await createRefund(this.store, id);
  }
}

async function initialize(force) {
  let store = new Sequelize(
    `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    {
      logging: false,
    }
  );

  try {
    defineAccount(store);
  } catch (error) {
    console.log(error.message);
  }

  try {
    defineCharge(store);
  } catch (error) {
    console.log(error.message);
  }

  try {
    defineMerchant(store);
  } catch (error) {
    console.log(error.message);
  }

  try {
    definePayment(store);
  } catch (error) {
    console.log(error.message);
  }

  try {
    defineRefund(store);
  } catch (error) {
    console.log(error.message);
  }

  try {
    defineTransaction(store);
  } catch (error) {
    console.log(error.message);
  }

  try {
    defineUser(store);
  } catch (error) {
    console.log(error.message);
  }

  try {
    defineAssociations(store);
  } catch (error) {
    console.log(error.message);
  }

  try {
    await autoMigrate(store, force);
  } catch (error) {
    console.log(error.message);
  }

  try {
    suspenseAccount = await store.models.Account.findOne({
      where: { type: "suspense" },
    });

    if (typeof suspenseAccount === "undefined" || suspenseAccount === null) {
      await store.models.Account.create({ type: "suspense" });
    }

    feeAccount = await store.models.Account.findOne({ where: { type: "fee" } });
    if (typeof feeAccount === "undefined" || feeAccount === null) {
      await store.models.Account.create({ type: "fee" });
    }
  } catch (error) {
    console.log(error.message);
  }

  return store;
}

async function autoMigrate(store, force) {
  await store.sync({ force: force });
  console.log("All models were synchronized successfully.");
}

module.exports = {
  Squire,
};
