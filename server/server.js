const express = require('express')      
const { createServer } = require('http')
const { Server } = require('socket.io')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.get('/ping', (req, res) => {
  res.json({ ok: true })
})

const photosDir = path.join(__dirname, '..', 'photos')
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photosDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    cb(null, `photo_${timestamp}.jpg`)
  }
})
const upload = multer({ storage })

app.post('/upload-photo', upload.single('photo'), (req, res) => {
  console.log('Photo saved:', req.file.filename)
  res.json({ success: true, filename: req.file.filename })
})

let onPhoneClipboard = null;

io.on('connection', (socket) => {
  console.log('Device connected:', socket.id)

  socket.on('clipboard_from_phone', (text) => {
    if (onPhoneClipboard) onPhoneClipboard(text) 
  })

  socket.on('disconnect', () => {
    console.log('Device disconnected:', socket.id)
  })
})

httpServer.listen(3000, '0.0.0.0', () => {
  console.log('Sync server running on port 3000')
})

module.exports = { io,setPhoneClipboardHandler:(fn)=>{onPhoneClipboard=fn} }  