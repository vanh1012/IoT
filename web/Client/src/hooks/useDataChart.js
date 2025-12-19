"use client";

import { useEffect, useState } from "react";
import { getDataChartApi } from "../services/auth.service";

export default function useChartData() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getChartData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await getDataChartApi();
            setData(res); // res đã là mảng 100 phần tử
        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getChartData();
    }, []);

    return {
        data,          // mảng sensor (mới nhất → cũ)
        loading,
        error,
        refetch: getChartData,
    };
}
