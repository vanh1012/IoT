import axios from "./axiosClient";
export const getMeApi = async () => {
    const res = await axios.get("/auth/me");
    return res.data.data;
};