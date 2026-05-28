import AsyncStorage from '@react-native-async-storage/async-storage'

const IP_KEY = 'server_ip'

export const saveIP = async (ip: string) => {
  await AsyncStorage.setItem(IP_KEY, ip)
}

export const getIP = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(IP_KEY)
}

export const clearIP = async () => {
  await AsyncStorage.removeItem(IP_KEY)
}