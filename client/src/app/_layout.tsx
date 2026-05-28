import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { getIP } from '../utils/storage'
import { router } from 'expo-router'

export default function Layout() {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    getIP().then(ip => {
      setChecked(true)
      if (!ip) router.replace('/setup')
    }).catch(()=>{
      setChecked(true)
      router.replace('/setup')
    })  
  }, [])

  if (!checked) return <Stack screenOptions={{ headerShown: false }} />

  return <Stack screenOptions={{ headerShown: false }} />
}