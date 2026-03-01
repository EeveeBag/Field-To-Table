import { Button } from '@/components/ui/button'
import { signOut, useSession } from '@/shared/auth/client'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

export function InfoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const logout = async () => {
    try {
      await signOut()
      queryClient.clear()
      navigate({ to: '/login', replace: true })
    } catch (error) {
      console.error('登出失敗:', error)
    }
  }

  const { data: userInfo } = useSession()

  return (
    <div>
      <p className="text-title text-sm tracking-wider md:text-base">個人資料</p>
      <div className="flex items-center mb-2 justify-between md:justify-start md:gap-4">
        <h1 className="text-2xl md:text-4xl font-bold font-sans-inter">Field to Table</h1>
        <img src="/logo.png" alt="logo" className="w-20" />
      </div>
      <div className="text-xs md:text-base flex flex-col gap-2 leading-5 text-content mb-6 md:leading-10">
        <span>
          從菜譜出發，幫你整理剛剛好的食材清單。
          <br />
          未來也會串接小農與好食材，依你需要的量訂購、保持新鮮。
          <br />
          讓每一餐吃得安心又透明。
        </span>
      </div>
      <section className="p-5 bg-white rounded-2xl mb-5 md:w-1/2">
        <p className="text-title text-sm tracking-wider mb-4">Account</p>

        <div className="flex gap-5 items-center mb-3">
          <img
            src={userInfo?.user?.image || '/logo.png'}
            alt="user avatar"
            className="w-16 h-16 rounded-full mb-3 border"
          />
          <div>
            <h2 className="mb-3 font-semibold text-2xl font-sans-inter">
              {userInfo?.user?.name || ''}
            </h2>
          </div>
        </div>
        <div className="flex justify-between md:justify-start md:gap-10 mb-5 mx-2">
          <div>
            <p className="text-earthTone-200 mb-1">Email</p>
            <p>{userInfo?.user?.email || ''}</p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full border-earthTone-200 text-earthTone-300 hover:bg-orange-100"
        >
          登出
        </Button>
      </section>
      <section className="p-5 bg-white rounded-2xl md:w-1/2">
        <p className="text-title text-sm tracking-wider mb-1 ">更多服務</p>
        <div className="text-earthTone-300 font-medium flex flex-col gap-2">
          <div className="py-1 border-b border-gray-300 ">小農合作</div>
          <div className="py-1 border-b border-gray-300 ">意見回饋</div>
        </div>
      </section>
    </div>
  )
}
