import axios from "axios";
import { backendhost } from "./config";

export const axiosUse = axios.create({
    baseURL: `${backendhost}`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});