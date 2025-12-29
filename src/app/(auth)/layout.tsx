import { requireNoAuth } from '@/utils/auth'

const layout = async ({ children }: { children: React.ReactNode }) => {
  await requireNoAuth()

  return (
    <>{children}</>
  )
}

export default layout
