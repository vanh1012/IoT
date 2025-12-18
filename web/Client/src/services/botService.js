import axios from "./axiosClient";
export const chatWithBotApi = async (message) => {
    const res = await axios.post("/project-bot/chat", { message });
    return res.data;
}

