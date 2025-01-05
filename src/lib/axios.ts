import axios from "axios"
import Constants from "expo-constants";

const api = axios.create({
  baseURL: "http://localhost:4000/api"
})

export default api