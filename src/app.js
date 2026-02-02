import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import protectedRoutes from './routes/protected.routes.js';
import { csrfProtection } from './middlewares/csrf.middleware.js';

const app = express();

//Parseos 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//agrega headers basicos de seguridad 
app.use(helmet())

//agregamos CSP, bloquea ejecucuion de scripts maliciosos
/**
 * Helmet solo reduce la superficie de ataque, CSP bloquea la ejecución.
 */
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],

      // Scripts solo desde tu dominio
      scriptSrc: ["'self'"],

      // Estilos si se usa css
      styleSrc: ["'self'"],

      // Imágenes
      imgSrc: ["'self'", 'data:'],

      // Bloquea iframes externos
      frameAncestors: ["'none'"],

      // Conexiones (API)
      connectSrc: ["'self'"],

      // Fuentes
      fontSrc: ["'self'"],

      // Objetos tipo Flash (bloqueados)
      objectSrc: ["'none'"],

      // Evita inyección base href
      baseUri: ["'self'"],
    },
  })
);

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

//csrf (despues de la sesion siempre)
app.use(csrfProtection);

//Ruta APIs
app.use('/auth', authRoutes); //no protegidas
app.use('/auth', protectedRoutes); //protegidas

//Ruta Public
app.use(express.static('public'));

//endpoint dedicado a enviar el token csrf al frontend (se pone en app por conveniencia y alcance global)
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