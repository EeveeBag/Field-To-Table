import { createFileRoute } from '@tanstack/react-router'
// import { LoginPage } from '@/features/auth/login'
import { HomePage } from '@/features/menu'

export const Route = createFileRoute('/')({
  component: RootLayout
})

function RootLayout() {
  // const token = localStorage.getItem('token')
  // if (token) {
  return <HomePage />
  // }
  // else {
  // return <LoginPage />
  // }
}
