import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import { getSettings } from "../../actions/settingsController"
import SettingsForm from "@/components/settings/SettingsForm"

export default async function Page() {
    const user = await getUserFromCookie()
    
    if (!user) {
        redirect("/login")
    }
    
    const settings = await getSettings()
    
    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configure your business information and preferences
                    </p>
                </div>
                
                {/* Settings Form */}
                <SettingsForm settings={settings} />
            </div>
        </div>
    )
}