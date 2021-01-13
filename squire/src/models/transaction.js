const { DataTypes } = require("sequelize");

module.exports = (store) => {
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
          "payout", //when merchant receives money
          "deposit", //when a user adds money to their account from outside
          "withdrawal", //when a user withdraws money form their account
          "transfer", // transfers between accounts of the same owner
          "refund"
          // "tip",
          // "fee"
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
        validate: { min: 0.0 },
      },
      feeAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
        validate: { min: 0.0 },
      },
      tipAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
        validate: { min: 0.0 },
      },
    },
    {
      paranoid: true,
      // indexes: [ { fields: ["SourceAccountUuid"] }, { fields: ["DestinationAccountUuid"] }, { fields: ["status"] }],
    }
  );
};
