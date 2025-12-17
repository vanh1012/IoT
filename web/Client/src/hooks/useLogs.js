"use client";

import { useEffect, useState } from "react";
import { getLogsApi } from "../services/auth.service";

export default function useLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const getLogs = async () => {
        try {
            setLoading(true);
            const res = await getLogsApi();
            setLogs(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLogs();
    }, []);

    return { logs, loading, getLogs };
}
