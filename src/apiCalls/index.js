import axios from "axios";

export const url = "https://quick-chat-backend-production.up.railway.app"

export const axiosInstance = axios.create({
    headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem('token')}`,
    }
});
