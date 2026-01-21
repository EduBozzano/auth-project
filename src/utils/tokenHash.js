import crypto from 'crypto';

//hasheamos el tokem, utilizamos crypto porque necesitamos un hasheo rapido
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};