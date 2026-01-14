import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

//configuracion de campos de USER para la bd
export const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    //los roles que puede tener el usuario
    role: { 
      type: DataTypes.ENUM('USER', 'ADMIN'),
      defaultValue: 'USER',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

