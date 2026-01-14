import 'dotenv/config';
import { sequelize } from './config/db.js';
import { app } from './app.js';

//conexion y sincronizacion a la bd
try {
  await sequelize.authenticate(); 
  await sequelize.sync(); 
  console.log('DB conectada');
} catch (error) {
  console.error('Error DB:', error);
}

//app puesta a escuchar
app.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});
