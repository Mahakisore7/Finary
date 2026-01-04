import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 font-sans">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">Finary AI</h1>
        <p className="mb-8 text-center text-sm text-zinc-400">Securely log in to your dashboard.</p>

        <form className="space-y-6" noValidate>
          {params?.error && (
            <div className="rounded-md border border-red-500/50 bg-red-500/10 p-3 text-center text-sm font-medium text-red-500">
              {params.error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email Address</label>
            <input 
              name="email" type="email" required
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:ring-1 focus:ring-zinc-700" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <input 
              name="password" type="password" required
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:ring-1 focus:ring-zinc-700" 
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button formAction={login} className="w-full rounded-md bg-white py-2 font-semibold text-black hover:bg-zinc-200">
              Log In
            </button>
            <button formAction={signup} className="w-full rounded-md border border-zinc-800 bg-transparent py-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
              Create New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}