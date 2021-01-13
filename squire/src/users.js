exports.signupUser = signupUser;
exports.getUser = getUser;
exports.listUsers = listUsers;

async function signupUser(store, user) {
  try {
    user = await store.models.User.create(user);
    userAccount = await store.models.Account.create({ type: "checking" });
    await user.setAccount(userAccount);
    return user;
  } catch (error) {
    console.log(error.message);
  }
}

async function getUser(store, id) {
  try {
    user = await store.models.User.findOne({ where: { uuid: id } });
    return user;
  } catch (error) {
    console.log(error.message);
  }
}

async function listUsers(store, query) {
  try {
    users = await store.models.User.findAll({ where: query });
    return users;
  } catch (error) {
    console.log(error.message);
  }
}
