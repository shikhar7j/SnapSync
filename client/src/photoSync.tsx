import * as MediaLibrary from 'expo-media-library'
import { SERVER_IP } from './constant'

const SERVER_URL = SERVER_IP 

const uploadPhoto=async(
  asset:MediaLibrary.Asset,
  onStatus:(status:string)=>void
)=>{
  try{
    const formData=new FormData()
    formData.append('photo',{
      uri:asset.uri,
      type:'image/jpeg',
      name:`photo_${Date.now()}.jpg` 
    } as any)

    const response=await fetch(`${SERVER_URL}/upload-photo`,{
      method:'POST',
      body:formData,
    })

    const data=await response.json()
    if(data.success){
      onStatus(`✅ Synced: ${data.filename}`)
      return true
    }
    return false
  }catch(err){
    onStatus('❌ Upload failed')
    console.error('Upload error:',err)
    return false
  }
}

export async function startPhotoSync(
  onStatus: (status: string) => void  
): Promise<() => void> {
  
  const { status } = await MediaLibrary.requestPermissionsAsync()
  console.log('Permission status:', status) 
  if (status !== 'granted') {
    onStatus('❌ Photo permission denied')
    return () => {}
  }

  onStatus('Uploading last 10 photos')
  const batch=await MediaLibrary.getAssetsAsync({
    mediaType:'photo',
    sortBy:'creationTime',
    first:10
  })

  const syncedIds=new Set<string>()

  for(let i=batch.assets.length-1;i>=0;i--){
    const asset=batch.assets[i];
    onStatus(`Uploading ${batch.assets.length-i}/${batch.assets.length}...`)
    await uploadPhoto(asset,onStatus)
    syncedIds.add(asset.id)
  }

  let lastPhotoId: string | null = null
  if (batch.assets.length > 0) {
    lastPhotoId = batch.assets[0].id
  }  

  onStatus('👀 Watching camera roll...')

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
      await uploadPhoto(latest,onStatus)
    }
  }, 3000)

  onStatus('👀 Watching camera roll...')
  return () => clearInterval(interval)
}