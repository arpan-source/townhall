import { supabase } from "../lib/supabase";

export async function getDashboardStats() {

    const { data, error } = await supabase
        .from("initiatives")
        .select(`
            *,
            departments (
                id,
                name
            ),
            profiles (
                full_name
            ),
            initiative_updates (
                id,
                created_at,
                blockers,
                progress
            )
        `);

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const today = new Date();

    const stats = {

        total: data.length,

        active: data.filter(
            (i) => i.status === "In Progress"
        ).length,

        completed: data.filter(
            (i) => i.status === "Completed"
        ).length,

        notStarted: data.filter(
            (i) => i.status === "Not Started"
        ).length,

        overdue: data.filter((i) => {

            if (!i.due_date) return false;

            return (
                new Date(i.due_date) < today &&
                i.status !== "Completed"
            );

        }).length,

    };

    const attention = [];

    data.forEach((initiative) => {

        if (
            initiative.due_date &&
            new Date(initiative.due_date) < today &&
            initiative.status !== "Completed"
        ) {

            attention.push({
                type: "Overdue",
                color: "red",
                initiative,
                reason: "Due date has passed.",
            });

        }

        const latestUpdate =
            initiative.initiative_updates?.[0];

        if (
            latestUpdate &&
            latestUpdate.blockers &&
            latestUpdate.blockers.trim() !== ""
        ) {

            attention.push({
                type: "Blocked",
                color: "orange",
                initiative,
                reason: latestUpdate.blockers,
            });

        }

    });

    const departmentHealth = {};

    data.forEach((initiative) => {

        const name =
            initiative.departments?.name ?? "Unassigned";

        if (!departmentHealth[name]) {

            departmentHealth[name] = {
                totalProgress: 0,
                initiatives: 0,
            };

        }

        departmentHealth[name].totalProgress +=
            initiative.progress ?? 0;

        departmentHealth[name].initiatives++;

    });

    const departments = Object.entries(departmentHealth).map(
        ([name, value]) => ({
            name,
            health: Math.round(
                value.totalProgress / value.initiatives
            ),
        })
    );

    return {
        data: {
            stats,
            attention,
            departments,
        },
        error: null,
    };

}