import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; //seguridad del hash

/**
 * metodo para hashear la password
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * metodo para comparar las password
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
