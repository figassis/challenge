import { DataTypes, Sequelize } from "sequelize";

export function defineUser(store: Sequelize) {
  store.define(
    "User",
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
      type: {
        type: DataTypes.ENUM("customer", "barber", "manager", "admin"),
        defaultValue: "customer",
        allowNull: false,
      },
    },
    { paranoid: true }
  );
}
