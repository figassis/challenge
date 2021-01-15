const faker = require("faker");
const { Squire } = require("squire");

async function main() {
  try {
    const squire = await new Squire();

    merchant = await createMerchant(squire);
    // console.log(merchant.get());
    // process.exit(0);
    barber = await createMerchantEmployee(squire, merchant.get("uuid"));
    // console.log(barber.get());
    // process.exit(0);
    customer = await createUser(squire);
    // console.log(customer.get());
    // process.exit(0);

    merchantAccount = await merchant.getAccount();
    barberAccount = await barber.getAccount();
    customerAccount = await customer.getAccount();
    // console.log(merchantAccount.get());
    // console.log(barberAccount.get());
    // console.log(customerAccount.get());
    // process.exit(0);

    await squire.createTransaction({
      type: "deposit",
      destinationAccountId: merchantAccount.get("uuid"),
      amount: 20,
    });
    merchantAccount = await merchant.getAccount();
    // console.log("merchant deposit", merchantAccount.get());
    // process.exit(0);

    await squire.createTransaction({
      type: "withdrawal",
      sourceAccountId: merchantAccount.get("uuid"),
      amount: 10,
    });
    merchantAccount = await merchant.getAccount();
    // console.log("merchant withdrawal", merchantAccount.get());
    // process.exit(0);

    await squire.createTransaction({
      type: "transfer",
      sourceAccountId: merchantAccount.get("uuid"),
      destinationAccountId: barberAccount.get("uuid"),
      amount: 10,
    });

    merchantAccount = await merchant.getAccount();
    barberAccount = await barber.getAccount();
    merchantTransactions = await squire.getAccountTransactions(
      merchantAccount.get("uuid")
    );
    // console.log(merchantAccount.get());
    // console.log(barberAccount.get());
    // process.exit(0);
    // console.log(merchantTransactions);
    // process.exit(0);

    // await squire.createTransaction({
    //   type: "transfer",
    //   sourceAccountId: barberAccount.get("uuid"),
    //   destinationAccountId: barberAccount.get("uuid"),
    //   amount: 10,
    // });
    // process.exit(0);

    await squire.createTransaction({
      type: "deposit",
      destinationAccountId: customerAccount.get("uuid"),
      amount: 100,
    });

    customerAccount = await customer.getAccount();
    // console.log(customerAccount.get());
    // process.exit(0);

    charge = await squire.chargeUser(
      customer.get("uuid"),
      barber.get("uuid"),
      20,
      4
    );
    // console.log("charge", charge.get());
    // process.exit(0);

    payment = await squire.createPayment(charge.get("uuid"));
    // console.log("payment", payment.get());
    // process.exit(0);

    customerAccount = await customer.getAccount();
    merchantAccount = await merchant.getAccount();
    barberAccount = await barber.getAccount();
    // console.log("merchant paid", merchantAccount.get());
    // console.log("barber paid", barberAccount.get());
    // console.log("customer charged", customerAccount.get());
    // process.exit(0);

    refund = await squire.createRefund(payment.get("uuid"));
    customerAccount = await customer.getAccount();
    merchantAccount = await merchant.getAccount();
    barberAccount = await barber.getAccount();

    // console.log("refund", refund.get());
    // console.log("merchant refund", merchantAccount.get());
    // console.log("barber refund", barberAccount.get());
    // console.log("customer refund", customerAccount.get());
    // process.exit(0);

    merchantTransactions = await squire.getAccountTransactions(
      merchantAccount.get("uuid")
    );
    barberTransactions = await squire.getAccountTransactions(
      barberAccount.get("uuid")
    );
    customerTransactions = await squire.getAccountTransactions(
      customerAccount.get("uuid")
    );
    // console.log("merchant transactions", merchantTransactions);
    // console.log("barber transactions", barberTransactions);
    // console.log("customer transactions", customerTransactions);
    // process.exit(0);

    merchantPayments = await squire.listPayments({
      MerchantUuid: merchant.get("uuid"),
    });

    customerPayments = await squire.listPayments({
      CustomerUuid: customer.get("uuid"),
    });

    merchantRefunds = await squire.listRefunds({
      MerchantUuid: merchant.get("uuid"),
    });

    customerRefunds = await squire.listRefunds({
      CustomerUuid: customer.get("uuid"),
    });

    // console.log("merchant payments", merchantPayments);
    // console.log("customer payments", customerPayments);
    // process.exit(0);

    // console.log("merchant refunds", merchantRefunds);
    // console.log("customer refunds", customerRefunds);
    // process.exit(0);

    refundTransaction = await refund.getTransaction();
    paymentFromRefund = await refund.getPayment();
    originalTransaction = await paymentFromRefund.getTransaction();
    // console.log("refund transaction", refundTransaction);
    // console.log("original transaction", originalTransaction);
    // process.exit(0);
  } catch (error) {
    console.log(error.message);
    process.exit(0);
  }
}

main();

async function createMerchant(squire) {
  return await squire.signupMerchant(
    {
      name: faker.name.findName(),
      email: faker.internet.email(),
    },
    faker.name.findName()
  );
}

async function createMerchantEmployee(squire, merchantID) {
  return await squire.addEmployee(merchantID, {
    name: faker.name.findName(),
    email: faker.internet.email(),
  });
}

async function createUser(squire) {
  return await squire.signupUser({
    name: faker.name.findName(),
    email: faker.internet.email(),
    type: "customer",
  });
}

async function createRandomUsers(squire, count) {
  for (let i = 0; i < count; i++) {
    await squire.signupMerchant(
      {
        name: faker.name.findName(),
        email: faker.internet.email(),
        type: "customer",
      },
      faker.name.findName()
    );
  }
}

function checkError(value) {
  // return typeof value === "undefined";
  if (typeof value === "undefined") {
    throw new Error("value is undefined");
  }
}
