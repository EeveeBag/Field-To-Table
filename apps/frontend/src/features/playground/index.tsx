import { useState } from 'react'
import { signIn, signOut, useSession } from '@/shared/auth/client'
import {
  useRecipes,
  useCreateRecipe,
  useDeleteRecipe,
  useUpdateRecipe
} from './hooks/useRecipes.example'
import type { RecipeType, UpdateRecipeInput } from '@repo/shared/schemas'
import type { InferResponseType } from 'hono/client'
import { client } from '@/api/client'

// 從 API 回應推導 Recipe 類型
type RecipesResponse = InferResponseType<typeof client.api.recipes.$get>
type Recipe = RecipesResponse['data'][number]

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
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn.email({
        email,
        password
      })

      if (result.error) {
        setError(result.error.message || 'Login failed')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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
  const {
    data: recipes,
    isLoading,
    error,
    refetch
  } = useRecipes({ page: 1, limit: 5 }, { enabled: !!session?.user })
  const createRecipe = useCreateRecipe()
  const updateRecipe = useUpdateRecipe()
  const deleteRecipe = useDeleteRecipe()

  // 編輯狀態
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<UpdateRecipeInput>({
    name: '',
    type: 'main',
    mainIngredient: '',
    servings: 1
  })

  const handleCreate = () => {
    createRecipe.mutate({
      name: `測試菜譜 ${Date.now()}`,
      type: 'main',
      mainIngredient: '肉',
      servings: 4
    })
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe.id)
    setEditForm({
      name: recipe.name,
      type: recipe.type,
      mainIngredient: recipe.mainIngredient || '',
      servings: recipe.servings
    })
  }

  const handleSave = () => {
    if (!editingId) return
    updateRecipe.mutate(
      {
        id: editingId,
        data: editForm
      },
      {
        onSuccess: () => {
          setEditingId(null)
        }
      }
    )
  }

  const handleCancel = () => {
    setEditingId(null)
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
                <li key={recipe.id} className="p-3">
                  {editingId === recipe.id ? (
                    // 編輯模式
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600">Name</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600">Type</label>
                          <select
                            value={editForm.type}
                            onChange={(e) =>
                              setEditForm({ ...editForm, type: e.target.value as RecipeType })
                            }
                            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          >
                            <option value="main">Main</option>
                            <option value="side">Side</option>
                            <option value="soup">Soup</option>
                            <option value="dessert">Dessert</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600">
                            Main Ingredient
                          </label>
                          <input
                            type="text"
                            value={editForm.mainIngredient}
                            onChange={(e) =>
                              setEditForm({ ...editForm, mainIngredient: e.target.value })
                            }
                            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600">
                            Servings
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.servings}
                            onChange={(e) =>
                              setEditForm({ ...editForm, servings: parseInt(e.target.value) || 1 })
                            }
                            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={updateRecipe.isPending}
                          className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                          {updateRecipe.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={updateRecipe.isPending}
                          className="rounded bg-slate-200 px-3 py-1 text-xs hover:bg-slate-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 顯示模式
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs">
                          {recipe.type}
                        </span>
                        <span>{recipe.name}</span>
                        <span className="text-sm text-slate-400">
                          {recipe.mainIngredient && `${recipe.mainIngredient} · `}
                          {recipe.servings} servings
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(recipe)}
                          className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(recipe.id)}
                          disabled={deleteRecipe.isPending}
                          className="rounded bg-red-100 px-2 py-1 text-xs text-red-600 hover:bg-red-200 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
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
