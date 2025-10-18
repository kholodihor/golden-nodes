import LoginForm from '@/features/auth/components/login-form'
import { requireUnauth } from '@/utils/auth'

const LoginPage = async () => {
  await requireUnauth()
  return (
    <div className='w-full h-screen flex items-center-safe justify-center-safe'>
      <LoginForm />
    </div>
  )
}

export default LoginPage
