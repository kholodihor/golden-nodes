import AppSidebar from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { requireAuth } from '@/utils/auth'

const layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='bg-accent/20'>
        {children}
      </SidebarInset>
    </SidebarProvider >
  )
}

export default layout
