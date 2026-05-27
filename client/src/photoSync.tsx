import * as MediaLibrary from 'expo-media-library'
import { SERVER_IP } from './constant'

const SERVER_URL = SERVER_IP 

export async function startPhotoSync(
  onStatus: (status: string) => void  
): Promise<() => void> {
  
  const { status } = await MediaLibrary.requestPermissionsAsync()
  console.log('Permission status:', status) 
  if (status !== 'granted') {
    onStatus('❌ Photo permission denied')
    return () => {}
  }
  console.log('Starting photo sync...')

  const initial = await MediaLibrary.getAssetsAsync({
    mediaType: 'photo',
    sortBy: 'creationTime',
    first: 1
  })
  console.log('Initial photo ID:', initial.assets[0]?.id)

  let lastPhotoId: string | null = null
  if (initial.assets.length > 0) {
    lastPhotoId = initial.assets[0].id
  }

  const uploadPhoto = async (asset: MediaLibrary.Asset) => {
    try {
      onStatus('📤 Uploading...')
      const uri=asset.uri;
      
      const formData = new FormData()
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`
      } as any)

      const response = await fetch(`${SERVER_URL}/upload-photo`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        onStatus(`✅ Synced: ${data.filename}`)
      }
    } catch (err) {
      onStatus('❌ Upload failed')
      console.error('Upload error:', err)
    }
  }

  const interval = setInterval(async () => {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: 'photo',
      sortBy: 'creationTime',
      first: 1
    })

    if (result.assets.length === 0) return
    const latest = result.assets[0]
    console.log('Polling - latest ID:', latest.id, 'last known:', lastPhotoId)

    if (latest.id !== lastPhotoId) {
      lastPhotoId = latest.id
      await uploadPhoto(latest)
    }
  }, 3000)

  onStatus('👀 Watching camera roll...')
  return () => clearInterval(interval)
}