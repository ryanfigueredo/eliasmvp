import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function MasterDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return redirect("/login")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bem-vindo, {session.user?.name}</h1>
      <p className="text-muted-foreground">Acesso: {session.user?.role}</p>
    </div>
  )
}
