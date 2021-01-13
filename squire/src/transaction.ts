import { DataTypes, Sequelize } from "sequelize";

export function defineTransaction(store: Sequelize) {
  store.define(
    "Transaction",
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM(
          "payment", //when customer pays a charge
          "deposit", //when a user adds money to their account from outside
          "withdrawal", //when a user withdraws money form their account
          "transfer", // transfers between accounts of the same owner
          "refund",
          "tip",
          "fee"
        ),
        defaultValue: "payment",
        allowNull: false,
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
        type: DataTypes.ENUM("pending", "completed", "error"),
        defaultValue: "pending",
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      feeAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      // indexes: [ { fields: ["SourceAccountUuid"] }, { fields: ["DestinationAccountUuid"] }, { fields: ["status"] }],
    }
  );
}
