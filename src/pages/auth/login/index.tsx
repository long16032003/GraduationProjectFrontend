import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { GalleryVerticalEnd } from 'lucide-react';
import { Link } from '@refinedev/core';
import LoginForm from './.form/LoginForm.tsx';

// https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/default/blocks/login-03
export default function LoginPage() {
  return (
    <div className='flex w-full max-w-sm flex-col gap-6'>
      <div className='flex justify-center'>
        <Link to='/'>
          <div className='flex items-center gap-4 group'>
            <img
              src='/logo_restaurant.jpg'
              alt='Logo'
              className='h-12 w-12 rounded-full object-cover border-2 border-orange-600 p-0.5 bg-white shadow-sm group-hover:border-orange-700 transition-colors'
            />
            <span className='text-2xl font-semibold text-orange-700 group-hover:text-orange-800 transition-colors'>
              BamBoo Sông Chanh
            </span>
          </div>
        </Link>
      </div>
      <div className='flex flex-col gap-6'>
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Chào mừng trở lại</CardTitle>
            <CardDescription>Đăng nhập với tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6'>
              <LoginForm />
              <div className='text-center text-sm'>
                Không có tài khoản?{' '}
                <Link
                  className='underline underline-offset-4'
                  to='/register'
                >
                  {' '}
                  Đăng ký
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
