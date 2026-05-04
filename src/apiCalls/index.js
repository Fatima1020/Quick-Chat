import axios from "axios";

export const url = "http://localhost:5000"

export const axiosInstance = axios.create({
    headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem('token')}`,
    }
});