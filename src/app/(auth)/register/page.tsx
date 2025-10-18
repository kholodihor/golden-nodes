import RegisterForm from '@/features/auth/components/register-form'
import { requireUnauth } from '@/utils/auth'

const RegisterPage = async () => {
  await requireUnauth()
  return (
    <div className='w-full h-screen flex items-center-safe justify-center-safe'>
      <RegisterForm />
    </div>
  )
}

export default RegisterPage
