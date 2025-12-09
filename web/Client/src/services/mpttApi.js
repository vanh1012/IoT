// src/api/mqttApi.js
import axiosClient from "./axiosClient";

const mqttApi = {
    send(topic, data) {
        return axiosClient.post("/mqtt/send", { topic, data });
    },
    status() {
        return axiosClient.get("/mqtt/status");
    },
};

export default mqttApi;
