import { useEffect } from "react";
import { getLastestApi } from "../services/auth.service";
import { useState } from "react";
import { socket } from "../socket";

export const useSensor = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. Load lần đầu (API)
  useEffect(() => {
    fetchLatestData();
  }, []);

  // 2. Lắng nghe realtime socket
  useEffect(() => {
    socket.on("sensor_latest", (sensor) => {
      console.log("📡 Realtime sensor:", sensor);

      setData({
        soilMoisture: sensor.soilMoisture,
        airHumidity: sensor.airHumidity,
        airTemperature: sensor.airTemperature,
      });
    });

    // cleanup khi unmount
    return () => {
      socket.off("sensor_latest");
    };
  }, []);

  const fetchLatestData = async () => {
    try {
      setLoading(true);
      const sensor = await getLastestApi();

      setData({
        soilMoisture: sensor.soilMoisture,
        airHumidity: sensor.airHumidity,
        airTemperature: sensor.airTemperature,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, fetchLatestData, loading };
};
