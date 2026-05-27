const { app, BrowserWindow, clipboard } = require('electron');
const { io,setPhoneClipboardHandler } = require('./server'); 

let lastClipboard='';

function startClipboardWatcher() {
  setInterval(() => {
    const current = clipboard.readText()
    if (current !== lastClipboard && current.trim() !== '') {
      lastClipboard = current
      console.log('Clipboard changed:', current)
      io.emit('clipboard', current)
    }
  }, 500)
};

function createWindow() {
  const win = new BrowserWindow({ width: 200, height: 200 })
  win.loadURL('data:text/html,<h2>Sync Server Running</h2>')
};

app.whenReady().then(() => {
  lastClipboard = clipboard.readText()
  createWindow()
  startClipboardWatcher()
  setPhoneClipboardHandler((text) => {
  clipboard.writeText(text)
  console.log('PC clipboard set from phone:', text)
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});