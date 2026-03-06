import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { connectDB } from './source/configuration/Database.js'
import dotenv from 'dotenv'
import { errorHandler } from './source/middlewares/Error.Middleware.js'
import routes from './source/routes.js'
import morgan from 'morgan'
import { apiLimiter } from './source/middlewares/Rate.Limitter.js'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const port = Number(process.env.PORT || 8001)
const app = express()

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim().replace(/\/$/, "") : 'http://localhost:5174';

// 1. CORS MUST BE FIRST
app.use(cors({
    credentials: true,
    origin: [clientUrl, 'http://localhost:5173', 'http://localhost:5174', 'https://htpayroll.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}))

app.use(express.json())

// 2. Status Routes
app.get('/', (req, res) => res.send('Backend is running! 🚀'))
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        clientUrl,
        dbConnected: mongoose.connection.readyState === 1
    })
})

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

await connectDB()
await registerUser()

app.use(routes)
app.use('/documents', express.static(path.join(__dirname, 'documents')))
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server listening to port: ${port}`)
})