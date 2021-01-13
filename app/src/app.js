const faker = require("faker");
const { Squire } = require("squire");

async function main() {
  try {
    const squire = await new Squire();

    merchant = await createMerchant(squire);
    // console.log(merchant.get());
    barber = await createMerchantEmployee(squire, merchant.get("uuid"));
    // console.log(barber.get());
    customer = await createUser(squire);
    // console.log(customer.get());

    merchantAccount = await merchant.getAccount();
    barberAccount = await barber.getAccount();
    customerAccount = await customer.getAccount();
    // console.log(merchantAccount.get());
    // console.log(barberAccount.get());
    // console.log(customerAccount.get());

    await squire.createTransaction({
      type: "deposit",
      destinationAccountId: merchantAccount.get("uuid"),
      amount: 20,
    });
    // merchantAccount = await merchant.getAccount();
    // console.log("merchant deposit", merchantAccount.get());

    await squire.createTransaction({
      type: "withdrawal",
      sourceAccountId: merchantAccount.get("uuid"),
      amount: 10,
    });
    // merchantAccount = await merchant.getAccount();
    // console.log("merchant withdrawal", merchantAccount.get());

    await squire.createTransaction({
      type: "transfer",
      sourceAccountId: merchantAccount.get("uuid"),
      destinationAccountId: barberAccount.get("uuid"),
      amount: 10,
    });

    merchantAccount = await merchant.getAccount();
    barberAccount = await barber.getAccount();
    // console.log(merchantAccount.get());
    // console.log(barberAccount.get());

    // await squire.createTransaction({
    //   type: "transfer",
    //   sourceAccountId: barberAccount.get("uuid"),
    //   destinationAccountId: barberAccount.get("uuid"),
    //   amount: 10,
    // });

    await squire.createTransaction({
      type: "deposit",
      destinationAccountId: customerAccount.get("uuid"),
      amount: 100,
    });

    merchantTransactions = await squire.getAccountTransactions(
      merchantAccount.get("uuid")
    );
    customerAccount = await customer.getAccount();
    console.log(customerAccount.get());

    charge = await squire.chargeUser(
      customer.get("uuid"),
      barber.get("uuid"),
      20,
      4
    );

    payment = await squire.createPayment(charge.get("uuid"));
    // console.log("charge", charge.get());
    // console.log("payment", payment.get());
    customerAccount = await customer.getAccount();
    merchantAccount = await merchant.getAccount();
    barberAccount = await barber.getAccount();
    console.log("merchant paid", merchantAccount.get());
    console.log("barber paid", barberAccount.get());
    console.log("customer charged", customerAccount.get());

    refund = await squire.createRefund(payment.get("uuid"));
    customerAccount = await customer.getAccount();
    merchantAccount = await merchant.getAccount();
    barberAccount = await barber.getAccount();

    console.log("refund", refund.get());
    console.log("merchant refund", merchantAccount.get());
    console.log("barber refund", barberAccount.get());
    console.log("customer refund", customerAccount.get());

    merchantTransactions = await squire.getAccountTransactions(
      merchantAccount.get("uuid")
    );
    barberTransactions = await squire.getAccountTransactions(
      barberAccount.get("uuid")
    );
    customerTransactions = await squire.getAccountTransactions(
      customerAccount.get("uuid")
    );
    console.log("merchant transactions", merchantTransactions);
    console.log("barber transactions", barberTransactions);
    console.log("customer transactions", customerTransactions);

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

    console.log("merchant payments", merchantPayments);
    console.log("customer payments", customerPayments);

    console.log("merchant refunds", merchantRefunds);
    console.log("customer refunds", customerRefunds);

    refundTransaction = await refund.getTransaction();
    paymentFromRefund = await refund.getPayment();
    originalTransaction = await paymentFromRefund.getTransaction();
    console.log("refund transaction", refundTransaction);
    console.log("original transaction", originalTransaction);

    // user = await squire.getUser("772ed047-e956-4462-b4bf-ecab0dad520d");
    // console.log(user);
    process.exit(0);
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
