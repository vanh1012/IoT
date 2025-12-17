import { useState } from "react";
import { createScheduleApi, deleteScheduleAPi, getSchedulesApi } from "../services/schedule.service";
import { useEffect } from "react";


export default function useSchedule(user) {
    const [schedules, setSchedules] = useState([]);
    useEffect(() => {
        fetchSchedules();
    }, [user]);
    const fetchSchedules = async () => {
        try {
            const data = await getSchedulesApi();
            console.log(data);
            setSchedules(data);
        }
        catch (err) {
            console.error(err);
        }
    }
    const createSchedule = async ({ action, time, duration }) => {

        try {
            const data = await createScheduleApi({ action, time, duration })
            setSchedules(pre => [...pre, data]);
        }
        catch (err) {
            console.error(err);
        }
    }
    const deleteSchedule = async ({ id }) => {
    
        try {
            const data = await deleteScheduleAPi({ id });
            await fetchSchedules();
        }
        catch (err) {
            console.error(err);
        }
    }
    return { fetchSchedules, createSchedule, deleteSchedule, schedules };
}
