import axios from "axios"

const api = axios.create({
  // URL para request desde mismo pc
  // baseURL: "http://localhost:4004/api"
  
  // URL para request desde emulador en mismo pc
  // baseURL: "http://10.0.2.2:4004/api"

  // URL para request directo al servidor de render
  baseURL: "https://shifts-table-backend.onrender.com/api"
})

export default api