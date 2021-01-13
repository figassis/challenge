const { DataTypes } = require("sequelize");

module.exports = (store) => {
  store.define(
    "Refund",
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      errorDescription: {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "completed",
          "refunded",
          "rejected",
          "error"
        ),
        defaultValue: "pending",
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
    },
    {
      paranoid: true,
      // indexes: [{ fields: ["status"] }],
    }
  );
};
