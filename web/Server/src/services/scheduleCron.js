import cron from "node-cron"
import Schedule from "../models/Schedule.js"
import { publishSettings } from "../config/mqtt.js"
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
        const user = await User.findOne()

        for (const s of schedules) {
            const startMin = toMinutes(s.time)
            const endMin = startMin + s.duration

            /* ===== START ===== */
            if (currentMinutes === startMin) {
                if (s.action === "pump" && user.pump === false) {
                    console.log(`▶️ START pump`)
                    publishSettings({ pump: true })
                    user.pump = true
                }

                if (s.action === "light" && user.light === false) {
                    console.log(`▶️ START light`)
                    publishSettings({ light: true })
                    user.light = true
                }
            }

            const hasNextSchedule = schedules.some(
                (next) =>
                    next.action === s.action &&
                    toMinutes(next.time) === endMin
            )

            /* ===== STOP ===== */
            if (currentMinutes === endMin && !hasNextSchedule) {
                if (s.action === "pump" && user.pump === true) {
                    console.log(`⏹ STOP pump`)
                    publishSettings({ pump: false })
                    user.pump = false
                }

                if (s.action === "light" && user.light === true) {
                    console.log(`⏹ STOP light`)
                    publishSettings({ light: false })
                    user.light = false
                }
            }
        }

        await user.save()
    },
    { timezone: TIMEZONE }
)
