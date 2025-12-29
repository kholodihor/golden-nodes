import AppHeader from '@/components/app-header'
import { requireAuth } from '@/utils/auth'

const layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth()

  return (
    <>
      <AppHeader />
      <main className='flex-1'>
        {children}
      </main>
    </>

  )
}

export default layout