import { useState } from 'react'
import { signIn, signOut, useSession } from './lib/auth-client'
import { useRecipes, useCreateRecipe, useDeleteRecipe } from './hooks/useRecipes.example'

export function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">API Playground</h1>
      <p className="mt-2 text-slate-600">測試 Hono Client + Better Auth</p>

      <div className="mt-8 space-y-8">
        <AuthSection />
        <RecipesSection />
      </div>
    </main>
  )
}

// 登入區塊
function AuthSection() {
  const { data: session, isPending } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('請輸入帳號和密碼')
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await signIn.email({
      email,
      password
    })

    if (result.error) {
      setError(result.error.message || 'Login failed')
    }

    setIsLoading(false)
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
    setIsLoading(false)
  }

  return (
    <section className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold">Authentication</h2>

      <div className="mt-4">
        {isPending ? (
          <p className="text-slate-500">Checking session...</p>
        ) : session?.user ? (
          <div className="space-y-3">
            <div className="rounded bg-green-50 p-3 text-green-800">
              Logged in as: <strong>{session.user.email}</strong>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {error && <div className="rounded bg-red-50 p-3 text-red-800">{error}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

// 菜譜測試區塊
function RecipesSection() {
  const { data: session } = useSession()
  const { data: recipes, isLoading, error, refetch } = useRecipes({ page: 1, limit: 5 })
  const createRecipe = useCreateRecipe()
  const deleteRecipe = useDeleteRecipe()

  const handleCreate = () => {
    createRecipe.mutate({
      name: `測試菜譜 ${Date.now()}`,
      type: 'main',
      mainIngredient: '肉',
      servings: 4
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除嗎？')) {
      deleteRecipe.mutate(id)
    }
  }

  if (!session?.user) {
    return (
      <section className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Recipes API</h2>
        <p className="mt-4 text-slate-500">Please login to test Recipes API</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recipes API</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={createRecipe.isPending}
            className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600 disabled:opacity-50"
          >
            {createRecipe.isPending ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={() => refetch()}
            className="rounded bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-slate-500">Loading recipes...</p>
        ) : error ? (
          <div className="rounded bg-red-50 p-3 text-red-800">Error: {error.message}</div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-slate-500">
              Total: {recipes?.pagination?.total ?? 0} recipes
            </div>
            <ul className="divide-y rounded border">
              {recipes?.data?.map((recipe) => (
                <li key={recipe.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs">{recipe.type}</span>
                    <span>{recipe.name}</span>
                    <span className="text-sm text-slate-400">({recipe.servings} servings)</span>
                  </div>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    disabled={deleteRecipe.isPending}
                    className="rounded bg-red-100 px-2 py-1 text-xs text-red-600 hover:bg-red-200 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </li>
              ))}
              {recipes?.data?.length === 0 && (
                <li className="p-3 text-slate-500">No recipes found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
