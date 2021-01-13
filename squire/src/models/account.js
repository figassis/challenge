const { DataTypes } = require("sequelize");

module.exports = (store) => {
  store.define(
    "Account",
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM(
          "merchant",
          "checking",
          "fee",
          // "withdrawals", //money goes here when users withdraw. This is to mock removing money from system
          // "deposits", //money comes from here when suers deposit. this si to mock adding money to system
          "suspense" //when payments are stored before being distributed to the shop, barber and fee accounts
        ),
        defaultValue: "checking",
        allowNull: false,
      },
      currency: {
        type: DataTypes.ENUM("usd"),
        defaultValue: "usd",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      availableBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      // indexes: [{ fields: ["status"] }, { fields: ["type"] }],
    }
  );
};
