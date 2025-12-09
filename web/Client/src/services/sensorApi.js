// src/api/sensorApi.js
import axiosClient from "./axiosClient";

const sensorApi = {
    latest() {
        return axiosClient.get("/sensor/latest");
    },
    history(limit = 50) {
        return axiosClient.get(`/sensor/history?limit=${limit}`);
    },
};

export default sensorApi;
