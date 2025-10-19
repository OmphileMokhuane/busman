import RegisterForm from "@/components/RegisterForm"
import { getUserFromCookie } from "@/lib/getUser"
import Dashboard from "@/components/Dashboard"

export default async function Home() {
    const user = await getUserFromCookie()
    
    return (
        <>
            {user &&  <Dashboard user={user}/>}
            {!user && (
                <>
                    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 px-4">
                        <p className="text-2xl text-center mb-5">
                            Don't have an account?{" "}
                            <strong className="text-primary">Create one</strong>
                        </p>
                        <div className="w-full max-w-md bg-base-200 p-8 rounded-2xl shadow-md">
                            <RegisterForm />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}