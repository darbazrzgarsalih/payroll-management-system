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
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const port = Number(process.env.PORT || 8001)
const app = express()

app.use(express.json())
app.use(cors({ credentials: true, origin: String(process.env.CLIENT_URL || 'http://localhost:5174') }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

await connectDB()

app.use(routes)
app.use('/documents', express.static(path.join(__dirname, 'documents')))
app.use(errorHandler)

app.listen(port, () => {
    
})