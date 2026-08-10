import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";

export function useDashboard() {

    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(true);

    const [attention, setAttention] = useState([]);

    const [departments, setDepartments] = useState([]);

    async function loadDashboard() {

        setLoading(true);

        const { data } =
            await getDashboardStats();

        setStats(data.stats);
        setAttention(data.attention);
        setDepartments(data.departments);

        setLoading(false);

    }

    useEffect(() => {
        loadDashboard();
    }, []);

    return {
        stats,
        loading,
        attention,
        departments,
        refresh: loadDashboard,
    };

}