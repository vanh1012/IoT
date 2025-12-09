// src/api/deviceApi.js
import axiosClient from "./axiosClient";

const deviceApi = {
    control(data) {
        return axiosClient.post("/device/control", data);
    },
};
export default deviceApi;
