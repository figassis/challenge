import { DataTypes, Sequelize } from "sequelize";

export function defineCharge(store: Sequelize) {
  store.define(
    "Charge",
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      errorDescription: {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("unpaid", "paid", "refunded", "error"),
        defaultValue: "unpaid",
        allowNull: false,
      },
      currency: {
        type: DataTypes.ENUM("usd"),
        defaultValue: "usd",
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      tipAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      // indexes: [{ fields: ["status"] }],
    }
  );
}
