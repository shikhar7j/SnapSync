import { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { io } from 'socket.io-client'
import * as Clipboard from 'expo-clipboard'
import { startPhotoSync } from '../photoSync'
import { getIP } from '../utils/storage'
import { router } from 'expo-router'

let socket:any=null

export default function Index() {
  const [connected, setConnected] = useState(false)
  const [lastSync, setLastSync] = useState('')
  const [pcInput, setPcInput] = useState('')
  const [photoStatus, setPhotoStatus] = useState('')
  const [syncingPhotos, setSyncingPhotos] = useState(false)
  const [stopSync, setStopSync] = useState<(() => void) | null>(null)
  const [batchSize, setBatchSize] = useState(10)

  useEffect(() => {
  const init = async () => {
    const ip = await getIP()
    if (!ip) return
    
    socket = io(ip)

    if (socket.connected) setConnected(true)
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('clipboard', async (text: string) => {
      await Clipboard.setStringAsync(text)
      setLastSync(text)
    })
  }
  init()

  return () => {
    socket?.off('connect')
    socket?.off('disconnect')
    socket?.off('clipboard')
  }
}, [])


  const togglePhotoSync = async () => {
  if (syncingPhotos) {
    if (stopSync) stopSync()
    setStopSync(null)
    setSyncingPhotos(false)
    setPhotoStatus('')
  } else {
      setSyncingPhotos(true)
      const ip=await getIP()
      if (!ip)return
      const cleanup = await startPhotoSync(ip,batchSize, setPhotoStatus)
      setStopSync(() => cleanup)
  }
}

  const syncPhoneClipboard = async () => {
    const text = await Clipboard.getStringAsync()
    if (text.trim() === '') return
    socket.emit('clipboard_from_phone', text)
    alert('Sent to PC!')
  }

  const sendToPC = async () => {
    if (pcInput.trim() === '') return
    socket.emit('clipboard_from_phone', pcInput)
    setPcInput('')
    alert('Sent to PC clipboard!')
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.status, { color: connected ? 'green' : 'red' }]}>
        {connected ? '🟢 Connected to PC!' : '🔴 Disconnected'}
      </Text>

      <TouchableOpacity 
        style={styles.changeIpBtn} 
        onPress={() => router.replace('/setup')} 
      >
        <Text style={styles.changeIpText}>⚙️ Change PC IP</Text>
      </TouchableOpacity>

      <View style={styles.photoBox}>
        <Text style={styles.syncLabel}>📷 Photo Sync:</Text>
        <Text style={styles.syncText}>{photoStatus || 'Not started'}</Text>

      <View style={styles.batchRow}>
        {[1, 3, 5, 10].map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.batchBtn, batchSize === n && styles.batchBtnActive]}
            onPress={() => setBatchSize(n)}>
            <Text style={[styles.batchBtnText, batchSize === n && styles.batchBtnTextActive]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

        <TouchableOpacity
          style={[styles.copyBtn, { backgroundColor: syncingPhotos ? '#f44336' : '#2196F3' }]}
          onPress={togglePhotoSync}>
          <Text style={styles.copyBtnText}>
            {syncingPhotos ? '⏹ Stop Sync' : '▶ Start Sync'}
          </Text>
        </TouchableOpacity>
      </View>
      {lastSync ? (
        <View style={styles.syncBox}>
          <Text style={styles.syncLabel}>📋 From PC:</Text>
          <Text style={styles.syncText}>{lastSync}</Text>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={async () => {
              await Clipboard.setStringAsync(lastSync)
              alert('Copied!')
            }}>
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={styles.syncLabel}>📱 Send to PC:</Text>
      <TextInput
        value={pcInput}
        onChangeText={setPcInput}
        placeholder="Paste or type here..."
        style={styles.input}
        multiline
      />
      <Button title="Send to PC" onPress={sendToPC} />
      <Button title="Send Clipboard to PC" onPress={syncPhoneClipboard} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 100, gap: 8 },
  status: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  photoBox: { backgroundColor: '#f0f4ff', padding: 12, borderRadius: 8 },
  syncBox: { backgroundColor: '#f0f9f0', padding: 12, borderRadius: 8 },
  syncLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  syncText: { fontSize: 14, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 },
  copyBtn: { marginTop: 8, backgroundColor: '#4CAF50', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  copyBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  changeIpBtn: { backgroundColor: '#e0e0e0', padding: 8, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 },
  changeIpText: { color: '#333', fontSize: 12, fontWeight: 'bold' },
  batchRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  batchBtn: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#2196F3', minWidth: 40, alignItems: 'center' },
  batchBtnActive: { backgroundColor: '#2196F3' },
  batchBtnText: { color: '#2196F3', fontWeight: 'bold' },
  batchBtnTextActive: { color: 'white' },
})