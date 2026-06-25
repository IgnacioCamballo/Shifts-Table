import axios from "axios"
import { Platform } from "react-native"

const LOCAL_API_BASE_URL = Platform.OS === "android"
  ? "http://10.0.2.2:4004/api"
  : "http://localhost:4004/api"

const api = axios.create({
  // URL para request desde mismo pc
  // baseURL: "http://localhost:4004/api"
  
  // URL para request desde emulador en mismo pc
  //baseURL: LOCAL_API_BASE_URL

  // URL para request directo al servidor de render
  baseURL: "https://shifts-table-backend.onrender.com/api"
})

export default api