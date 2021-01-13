exports.signupMerchant = signupMerchant;
exports.getMerchant = getMerchant;
exports.listMerchants = listMerchants;
exports.addEmployee = addEmployee;

async function signupMerchant(store, userDetails, merchantName) {
  try {
    merchant = await store.models.Merchant.create({ name: merchantName });
    userDetails.type = "manager";
    user = await store.models.User.create(userDetails);
    userAccount = await store.models.Account.create({ type: "checking" });
    merchantAccount = await store.models.Account.create({ type: "merchant" });
    await user.setAccount(userAccount);
    await merchant.setAccount(merchantAccount);
    return merchant;
  } catch (error) {
    console.log(error.message);
  }
}

async function getMerchant(store, id) {
  try {
    merchant = await store.models.Merchant.findOne({ where: { uuid: id } });
    return merchant;
  } catch (error) {
    console.log(error.message);
  }
}

async function listMerchants(store, query) {
  try {
    merchants = await store.models.Merchant.findAll({ where: query });
    return merchants;
  } catch (error) {
    console.log(error.message);
  }
}

async function addEmployee(store, id, userDetails) {
  try {
    merchant = await getMerchant(store, id);
    userDetails.type = "employee";
    user = await store.models.User.create(userDetails);
    userAccount = await store.models.Account.create({ type: "checking" });
    await user.setAccount(userAccount);
    await user.setMerchant(merchant);
    return user;
  } catch (error) {
    console.log(error.message);
  }
}

// doHaircut;
// refundCustomer;
