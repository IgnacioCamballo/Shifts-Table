import axios from "axios"

const api = axios.create({
  //baseURL: "http://localhost:4004/api"
  baseURL: "https://shifts-table-backend.onrender.com/api"
})

export default api