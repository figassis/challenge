import { Sequelize } from "sequelize";
import { defineAccount } from "./account";
import { defineAssociations } from "./associations";
import { defineCharge } from "./charge";
import { defineMerchant } from "./merchant";
import { definePayment } from "./payment";
import { defineRefund } from "./refund";
import { defineTransaction } from "./transaction";
import { defineUser } from "./user";

export async function initialize(): Promise<Sequelize> {
  let store = new Sequelize(
    `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
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
    await autoMigrate(store, true);
  } catch (error) {
    console.log(error.message);
  }

  return store;
}

export async function autoMigrate(store: Sequelize, force: boolean) {
  await store.sync({ force: force });
  console.log("All models were synchronized successfully.");
}

export async function resetDatabase(store: Sequelize) {
  await store.drop();
  console.log("Database was reset successfully.");
  await autoMigrate(store, true);
}
