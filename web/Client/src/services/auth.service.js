import axios from "./axiosClient";
export const getMeApi = async () => {
    const res = await axios.get("/auth/me");
    return res.data.data;
};


export const updateThresholdApi = async ({ tempHigh, tempLow, soilLow, soilHigh, humidLow, humidHigh }) => {
    const res = await axios.post("/device/threshold",
        {
            temp: { low: tempLow, high: tempHigh },
            soil: { low: soilLow, high: soilHigh },
            humid: { low: humidLow, high: humidHigh }
        });
    return res.data.data;
};

export const controlerDeviceApi = async ({ type, state }) => {
    const res = await axios.post("/device/control", { type, state });
    return res.data.data;
}

export const getLogsApi = async () => {
    const res = await axios.get("/logs");
    return res.data.data;
}