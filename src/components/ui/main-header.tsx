import { Link, useLocation } from 'react-router';
import { Button, Layout, Menu, Drawer, Dropdown } from 'antd';
import { UserOutlined, MenuOutlined, HomeOutlined, ReadOutlined, ShopOutlined, ContactsOutlined, LogoutOutlined, GiftOutlined } from '@ant-design/icons';
import { theme } from '@/config/theme';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import { MainNav } from '@/pages';
import { UserNav } from '../app/app-header';
import { useState } from 'react';
import { CalendarCheck, FileText, UtensilsCrossed } from 'lucide-react';

const { Header } = Layout;
const { token } = theme;

const menuItems = [
  {
    key: '/menu',
    icon: <UtensilsCrossed />,
    label: 'Thực đơn',
  },
  {
    key: '/promotions',
    icon: <GiftOutlined />,
    label: 'Ưu đãi',
  },
  {
    key: '/posts',
    icon: <FileText />,
    label: 'Bài viết',
  },
  {
    key: '/reservation',
    icon: <CalendarCheck />,
    label: 'Đặt bàn',
  },
];

export const MainHeader = () => {
  const user = use$(auth$.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    // Xử lý đăng xuất ở đây
    auth$.user.set(null);
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      className="h-auto p-0 bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm"
    >
      <div className={`mx-auto max-w-6xl px-4`}>
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always visible */}
          <Link to="/" className="flex items-center gap-4">
            <img 
              src="/logo_restaurant.jpg" 
              alt="Logo" 
              className="h-10 w-10 rounded-full object-cover border-2 border-orange-600 p-0.5 bg-white shadow-sm"
            />
            <span className="text-xl font-semibold text-orange-700 hidden sm:block">
              BamBoo Sông Chanh
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 ml-8">
            <MainNav/>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <UserNav user={user}/>
            ) : (
              <>
                <Link to="/login-customer">
                  <Button 
                    type="primary"
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: '#ea580c',
                      borderColor: '#ea580c'
                    }}
                    className="hover:bg-orange-700 border-none"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    style={{
                      borderColor: '#ea580c',
                      color: '#ea580c'
                    }}
                    className="hover:bg-orange-50"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuOutlined className="text-xl" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <img 
              src="/logo_restaurant.jpg" 
              alt="Logo" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-lg font-semibold text-orange-700">
              BamBoo Sông Chanh
            </span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="md:hidden"
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-none bg-transparent"
          onClick={({ key }) => {
            window.location.href = key;
            setMobileMenuOpen(false);
          }}
        />
        
        {user ? (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
              <UserOutlined />
              <span className="text-gray-600">{user.email}</span>
            </div>
            <Button 
              block
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Đăng xuất
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
            <Link to="/login">
              <Button 
                type="primary" 
                block
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#ea580c',
                  borderColor: '#ea580c'
                }}
                className="hover:bg-orange-700 border-none"
              >
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                block
                style={{
                  borderColor: '#ea580c',
                  color: '#ea580c'
                }}
                className="hover:bg-orange-50"
              >
                Đăng ký
              </Button>
            </Link>
          </div>
        )}
      </Drawer>
    </Header>
  );
};