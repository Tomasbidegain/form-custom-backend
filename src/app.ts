import express from 'express'
import session from 'express-session'
import passport from 'passport'
import './config/passport'

import authRoutes from './routes/auth.routes'

const app = express()

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'tu_secret_aqui',
    resave: false,
    saveUninitialized: false,
  })
)

// Inicializar Passport
app.use(passport.initialize())
app.use(passport.session())

// Middlewares globales
app.use(express.json()) // Parsea JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })) // Parsea formularios

app.use('/api/auth', authRoutes)

// app.use('/api/forms', formRoutes)

export default app