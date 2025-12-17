import cron from "node-cron"
import Schedule from "../models/Schedule.js"
import { publishSettings } from "../services/mqttService.js"
import User from "../models/User.js"

const TIMEZONE = "Asia/Ho_Chi_Minh"

const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number)
    return h * 60 + m
}

cron.schedule(
    "*/1 * * * *",
    async () => {
        const now = new Date()
        const currentTime = now.toTimeString().slice(0, 5)
        const currentMinutes = toMinutes(currentTime)

        const schedules = await Schedule.find({})

        for (const s of schedules) {
            const startMin = toMinutes(s.time)
            const endMin = startMin + s.duration

            if (currentMinutes - startMin <= 1) {
                console.log(`▶️ START ${s.action}`)
                publishSettings({ [s.action]: true })
                const user = await User.findOne();
                if (s.action === "pump" && user.pump !== true)
                    user.pump = true;
                if (s.action === "light" && user.light !== true)
                    user.light = true;
                await user.save();
            }

            const hasNextSchedule = schedules.some(
                (next) =>
                    next.action === s.action &&
                    toMinutes(next.time) === endMin
            )

            if (
                currentMinutes - endMin <= 1 &&
                !hasNextSchedule
            ) {
                console.log(`⏹ STOP ${s.action}`)
                publishSettings({ [s.action]: false })
                const user = await User.findOne();
                if (s.action === "pump")
                    user.pump = false;
                if (s.action === "light")
                    user.light = false;
                await user.save();
            }
        }
    },
    { timezone: TIMEZONE }
)
