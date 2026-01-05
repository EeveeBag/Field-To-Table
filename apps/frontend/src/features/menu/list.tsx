export function MenuPage({ title = 'Menu' }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-slate-600">菜譜列表頁</p>
    </main>
  )
}
