import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function getUserFromCookie() {
    // ✅ Await cookies() first
    const cookieStore = await cookies()
    const theCookie = cookieStore.get("BmanApp")?.value

    if (theCookie) {
        try {
            console.log("Verifying JWT token from cookie...")
            const decoded = jwt.verify(theCookie, process.env.JWT_SECRET)
            return decoded
        } catch (err) {
            console.error("JWT verification failed:", err.message)
            return null
        }
    }

    return null
}
