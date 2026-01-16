import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import { csrfProtection } from './middlewares/csrf.middleware.js';

const app = express();

//Parseos 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Sesiones
app.use(
  session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

//crdf (despues de la sesion siempre)
app.use(csrfProtection);

//Ruta
app.use('/auth', authRoutes);

//endpoint dedicado a enviar el token csrf al frontend
app.get('/csrf-token', (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
  });
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      message: 'Token CSRF inválido o ausente',
    });
  }

  next(err);
});


export { app } ;