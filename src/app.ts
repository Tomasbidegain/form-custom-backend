import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import passport from 'passport'
import './config/passport'

import authRoutes from './routes/auth.routes'
import formRoutes from './routes/form.routes'
import userRoutes from './routes/user.routes'
import fileRoutes from './routes/file.routes'

const app = express()

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(cookieParser())

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
app.use('/api/forms', formRoutes)
app.use('/api/users', userRoutes)
app.use('/api/files', fileRoutes)

export default app