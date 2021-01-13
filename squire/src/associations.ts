import { Sequelize } from "sequelize/types";

export function defineAssociations(store: Sequelize) {
  const {
    Account,
    User,
    Transaction,
    Refund,
    Payment,
    Merchant,
    Charge,
  } = store.models;

  // User associations
  User.belongsTo(Merchant, { foreignKey: { allowNull: true } });
  User.hasOne(Account, { foreignKey: { allowNull: true } });

  // Merchant Accociations
  Merchant.hasOne(Account, { as: "Account", foreignKey: { allowNull: true } }); //Account.merchantId

  // Transaction associations
  Transaction.belongsTo(Account, {
    as: "SourceAccount",
    foreignKey: { allowNull: false },
  });
  Transaction.belongsTo(Account, {
    as: "DestinationAccount",
    foreignKey: { allowNull: false },
  });

  // Charge associations
  Charge.belongsTo(Merchant, { foreignKey: { allowNull: false } });
  Charge.belongsTo(User, { as: "Customer", foreignKey: { allowNull: false } });
  Charge.belongsTo(User, { as: "Barber", foreignKey: { allowNull: false } });

  // Payment associations
  Payment.belongsTo(Merchant, { foreignKey: { allowNull: false } });
  Payment.belongsTo(User, { as: "Customer", foreignKey: { allowNull: false } });
  Payment.belongsTo(Charge, { foreignKey: { allowNull: false } });
  Payment.hasOne(Transaction, { foreignKey: { allowNull: true } });
  Payment.hasOne(Refund, { foreignKey: { allowNull: true } });

  // Refund associations
  Refund.belongsTo(Merchant, { foreignKey: { allowNull: false } });
  Refund.belongsTo(User, { as: "Customer", foreignKey: { allowNull: false } });
  Refund.belongsTo(Charge, { foreignKey: { allowNull: false } });
  Refund.belongsTo(Payment, { foreignKey: { allowNull: false } });
  Refund.hasOne(Transaction, { foreignKey: { allowNull: true } });

  Payment.hasOne(Transaction, { foreignKey: { allowNull: true } });
}
