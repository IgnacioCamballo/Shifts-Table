import axios from "axios"

const api = axios.create({
  baseURL: "https://shifts-table-backend.onrender.com/api"
})

export default api