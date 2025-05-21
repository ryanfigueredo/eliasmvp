export default function UnauthorizedPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold text-red-600">Acesso não autorizado</h1>
      <p className="text-zinc-600 mt-2">
        Você não tem permissão para acessar esta página.
      </p>
    </div>
  )
}
