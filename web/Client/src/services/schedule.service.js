import axios from "./axiosClient";



export async function getSchedulesApi() {
    const res = await axios.get("/schedule");
    return res.data.data;
}


export async function createScheduleApi({ action, time, duration }) {
    const res = await axios.post("/schedule", { action, time, duration });
    return res.data.data;
}

export async function deleteScheduleAPi({ id }) {
    const res = await axios.delete(`/schedule/${id}`);
}