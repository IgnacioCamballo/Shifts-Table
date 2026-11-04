import axios from "axios"
import { Platform } from "react-native"

const LOCAL_API_BASE_URL = Platform.OS === "android"
  ? "http://10.0.2.2:4004/api"
  : "http://localhost:4004/api"

// URL para producion, directo a mi servidor
const PRODUCTION_API_BASE_URL = "https://shifts-table-server.kanatzu.dev/api"

const api = axios.create({
  // __DEV__ es true con expo start (servidor local) y false en los builds de EAS
  baseURL: __DEV__ ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL
})

export default api