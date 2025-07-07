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
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/bamboo_restaurant.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <Link to="/" className="block mb-8 text-center">
            <div className="flex items-center justify-center gap-4 group mb-4">
              <img
                src="/logo_restaurant.jpg"
                alt="Logo"
                className="h-16 w-16 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-105 transition-transform"
              />
              <span className="text-3xl font-bold text-white drop-shadow-lg group-hover:text-blue-200 transition-colors">
                BamBoo Sông Chanh
              </span>
            </div>
          </Link>
          
          {/* Login Card */}
          <Card className="shadow-2xl backdrop-blur-md bg-white/95 border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-orange-700">Đăng Nhập Nhân Viên</CardTitle>
              <CardDescription className="text-gray-600">Đăng nhập với tài khoản của bạn để quản lý hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <LoginForm />
                <div className="text-center text-sm space-y-2">
                  {/* <div>
                    Không có tài khoản?{' '}
                    <Link
                      className="underline underline-offset-4"
                      to="/register"
                    >
                      Đăng ký
                    </Link>
                  </div> */}
                  
                  <div className="pt-2 border-t border-gray-100">
                    Bạn là khách hàng?{' '}
                    <Link
                      className="underline underline-offset-4 text-blue-600 hover:text-blue-700"
                      to="/login-customer"
                    >
                      Đăng nhập khách hàng
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Info */}
          {/* <div className="mt-8 text-center">
            <p className="text-white/80 drop-shadow text-sm">Cần hỗ trợ? Liên hệ với chúng tôi</p>
            <p className="text-blue-300 font-medium text-lg drop-shadow">033 328 3999</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
