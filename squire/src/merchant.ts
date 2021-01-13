import { DataTypes, Sequelize } from "sequelize";

export function defineMerchant(store: Sequelize) {
  store.define(
    "Merchant",
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "pending", "suspended", "closed"),
        defaultValue: "active",
        allowNull: false,
      },
    },
    {
      paranoid: true,
      // indexes: [{ fields: ["status"] }],
    }
  );
}
