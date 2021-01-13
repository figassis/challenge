const { DataTypes } = require("sequelize");

module.exports = (store) => {
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
        type: DataTypes.ENUM(
          "unpaid",
          "paid",
          "refunded",
          "cancelled",
          "error"
        ),
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
      // indexes: [{ fields: ["status"] }],
    }
  );
};
