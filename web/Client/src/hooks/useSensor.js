import { useEffect } from "react";
import { getLastestApi } from "../services/auth.service";
import { useState } from "react";


export const useSensor = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchLatestData();
    }, []);
    const fetchLatestData = async () => {
        try {
            setLoading(true);
            const data = await getLastestApi();
            setData(
                {
                    soilMoisture: data.soilMoisture,
                    airHumidity: data.airHumidity,
                    airTemperature: data.airTemperature
                }
            )
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }
    return { data, fetchLatestData, loading }
}