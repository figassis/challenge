const { createTransaction } = require("./accounts");

exports.chargeUser = chargeUser;
exports.createPayment = createPayment;
exports.createRefund = createRefund;
exports.getCharge = getCharge;
exports.listCharges = listCharges;
exports.getPayment = getPayment;
exports.listPayments = listPayments;
exports.getRefund = getRefund;
exports.listRefunds = listRefunds;

async function chargeUser(store, customerId, barberId, amount, tipAmount) {
  try {
    if (amount <= 0) {
      throw new Error("invaid amount");
    }

    if (tipAmount < 0) {
      throw new Error("invaid tip amount");
    }

    if (tipAmount >= amount) {
      throw new Error("tip amount must be less than the service price");
    }

    customer = await store.models.User.findOne({ where: { uuid: customerId } });
    barber = await store.models.User.findOne({ where: { uuid: barberId } });
    merchant = await store.models.Merchant.findOne({
      where: { uuid: barber.get("MerchantUuid") },
    });

    charge = await store.models.Charge.create({
      description: `Haircut by ${barber.get("name")} from ${merchant.get(
        "name"
      )}`,
      amount: amount,
      tipAmount: tipAmount,
      MerchantUuid: merchant.get("uuid"),
      CustomerUuid: customer.get("uuid"),
      BarberUuid: barber.get("uuid"),
    });

    return charge;
  } catch (error) {
    console.log(error.message);
  }
}

async function createPayment(store, chargeId) {
  // try {
  charge = await getCharge(store, chargeId);
  customer = await charge.getCustomer();
  merchant = await charge.getMerchant();
  customerAccount = await customer.getAccount();
  merchantAccount = await merchant.getAccount();

  amount = parseFloat(charge.get("amount"));
  tipAmount = parseFloat(charge.get("tipAmount"));
  total = amount + tipAmount;

  if (amount <= 0) {
    throw new Error("invaid amount");
  }

  if (tipAmount < 0) {
    throw new Error("invaid tip amount");
  }

  if (tipAmount >= amount) {
    throw new Error("tip amount must be less than the service price");
  }

  availableBalance = parseFloat(customerAccount.get("availableBalance"));
  balance = parseFloat(customerAccount.get("balance"));

  if (total > availableBalance || total > balance) {
    throw new Error("insufficient funds");
  }

  payment = await store.models.Payment.create({
    amount: total,
    MerchantUuid: merchant.get("uuid"),
    CustomerUuid: customer.get("uuid"),
    ChargeUuid: charge.get("uuid"),
  });

  await createTransaction(store, {
    type: "payment",
    amount: total,
    paymentId: payment.get("uuid"),
  });

  payment = await store.models.Payment.findOne({
    where: { uuid: payment.get("uuid") },
  });
  return payment;
  // } catch (error) {
  //   console.log(error.message);
  // }
}

async function createRefund(store, paymentId) {
  try {
    payment = await getPayment(store, paymentId);
    charge = await payment.getCharge();
    customer = await charge.getCustomer();
    merchant = await charge.getMerchant();

    refund = await store.models.Refund.create({
      amount: total,
      reason: "customer complaint",
      MerchantUuid: merchant.get("uuid"),
      CustomerUuid: customer.get("uuid"),
      ChargeUuid: charge.get("uuid"),
      PaymentUuid: payment.get("uuid"),
    });

    await createTransaction(store, {
      type: "refund",
      refundId: refund.get("uuid"),
    });

    refund = await store.models.Refund.findOne({
      where: { uuid: refund.get("uuid") },
    });
    return refund;
  } catch (error) {
    console.log(error.message);
  }
}

async function getCharge(store, id) {
  try {
    user = await store.models.Charge.findOne({ where: { uuid: id } });
    return user;
  } catch (error) {
    console.log(error.message);
  }
}

async function listCharges(store, query) {
  try {
    users = await store.models.Charge.findAll({ where: query });
    return users;
  } catch (error) {
    console.log(error.message);
  }
}

async function cancelCharge(store, id) {
  try {
    charge = await store.models.Charge.update(
      { status: "cancelled" },
      { where: { uuid: id } }
    );
    return charge;
  } catch (error) {
    console.log(error.message);
  }
}

async function getPayment(store, id) {
  try {
    user = await store.models.Payment.findOne({ where: { uuid: id } });
    return user;
  } catch (error) {
    console.log(error.message);
  }
}

async function listPayments(store, query) {
  try {
    users = await store.models.Payment.findAll({ where: query });
    return users;
  } catch (error) {
    console.log(error.message);
  }
}

async function getRefund(store, id) {
  try {
    user = await store.models.Refund.findOne({ where: { uuid: id } });
    return user;
  } catch (error) {
    console.log(error.message);
  }
}

async function listRefunds(store, query) {
  try {
    users = await store.models.Refund.findAll({ where: query });
    return users;
  } catch (error) {
    console.log(error.message);
  }
}
