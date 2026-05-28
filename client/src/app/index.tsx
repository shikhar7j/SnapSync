import { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { io } from 'socket.io-client'
import * as Clipboard from 'expo-clipboard'
import { startPhotoSync } from '../photoSync'
import { SERVER_IP } from '../constant'

const socket = io(SERVER_IP) 

export default function Index() {
  const [connected, setConnected] = useState(false)
  const [lastSync, setLastSync] = useState('')
  const [pcInput, setPcInput] = useState('')
  const [photoStatus, setPhotoStatus] = useState('')
  const [syncingPhotos, setSyncingPhotos] = useState(false)
  const [stopSync, setStopSync] = useState<(() => void) | null>(null)

  useEffect(() => {
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('clipboard', async (text: string) => {
      await Clipboard.setStringAsync(text)
      setLastSync(text)
    })
    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('clipboard')
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
      const cleanup = await startPhotoSync(setPhotoStatus)
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

      <View style={styles.photoBox}>
        <Text style={styles.syncLabel}>📷 Photo Sync:</Text>
        <Text style={styles.syncText}>{photoStatus || 'Watching camera roll...'}</Text>
      </View>
      <View style={styles.photoBox}>
        <Text style={styles.syncLabel}>📷 Photo Sync:</Text>
        <Text style={styles.syncText}>{photoStatus || 'Not started'}</Text>
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
})