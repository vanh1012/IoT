// src/api/scheduleApi.js
import axiosClient from "./axiosClient";

const scheduleApi = {
    create(data) {
        return axiosClient.post("/schedule", data);
    },
    getAll() {
        return axiosClient.get("/schedule");
    },
    update(id, data) {
        return axiosClient.put(`/schedule/${id}`, data);
    },
    delete(id) {
        return axiosClient.delete(`/schedule/${id}`);
    },
};

export default scheduleApi;
