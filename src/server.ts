import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import prisma from './config/database'
import { initSocket } from './config/socket'
import { createServer } from 'http'

const PORT = process.env.PORT || 3000

async function main() {
  try {
    // Conectar a la base de datos
    await prisma.$connect()
    console.log('✓ Database connected')

    // Crear servidor HTTP
    const httpServer = createServer(app)

    // Inicializar Socket.io
    initSocket(httpServer)
    console.log('✓ Socket.io initialized')

    // Iniciar servidor
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

main()
