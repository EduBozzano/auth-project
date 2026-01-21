import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const RefreshToken = sequelize.define('RefreshToken', {
  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
