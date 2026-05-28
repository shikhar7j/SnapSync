import { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import { saveIP } from '../utils/storage'
import { router } from 'expo-router'

export default function Setup() {
  const [ip, setIp] = useState('')

  const handleSave = async () => {
    if (!ip.trim()) {
      Alert.alert('Error', 'Please enter an IP address')
      return
    }

    const formatted = ip.startsWith('http') ? ip : `http://${ip}:3000`

    try {
        console.log(`👀 DEBUG: Trying to ping -> ${formatted}/ping`)
        const response = await fetch(`${formatted}/ping`, {  
      })
      if (response.ok) {
        console.log("✅ DEBUG: Ping successful!")    
        await saveIP(formatted)
        console.log("✅ DEBUG: IP saved successful!")
        router.replace('/')
      } else {
        Alert.alert('Error', 'Could not connect to server. Is it running?')
      }
    } catch {
      Alert.alert('Error', 'Could not reach server. Check the IP and try again.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔌 Connect to PC</Text>
      <Text style={styles.subtitle}>Enter your PC's local IP address</Text>
      <Text style={styles.hint}>
        Run ipconfig on your PC and look for IPv4 Address
      </Text>
      <TextInput
        value={ip}
        onChangeText={setIp}
        placeholder="192.168.1.x"
        style={styles.input}
        keyboardType="url"
      />
      <Button title="Connect" onPress={handleSave} />
    </View> 
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 8 },
  hint: { fontSize: 12, color: '#999', marginBottom: 24, lineHeight: 18 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, fontSize: 18, marginBottom: 16 },
})