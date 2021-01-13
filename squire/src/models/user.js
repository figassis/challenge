const { DataTypes } = require("sequelize");

module.exports = (store) => {
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
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      type: {
        type: DataTypes.ENUM("customer", "employee", "manager", "admin"),
        defaultValue: "customer",
        allowNull: false,
      },
    },
    { paranoid: true }
  );
};
