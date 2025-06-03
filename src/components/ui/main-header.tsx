import { Link } from 'react-router';
import { Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { theme } from '@/config/theme';
import { use$ } from '@legendapp/state/react';
import auth$ from '@/stores/auth';
import { MainNav } from '@/pages';
import { UserNav } from '../app/app-header';

const { token } = theme;

export const MainHeader = () => {
  const user = use$(auth$.user);

  return (
    <div
      style={{
        borderBottom: `1px solid ${token?.colorBorderSecondary}`,
        backgroundColor: token?.colorBgContainer + 'B3', // 70% opacity
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: token?.boxShadowSecondary,
      }}
    >
      <div
        style={{
          display: 'flex',
          height: 64,
          alignItems: 'center',
          padding: `0 ${token?.padding}px`,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <Link to='/'>
          <div className='flex items-center gap-4'>
            <img
              src='/logo_restaurant.jpg'
              alt='Logo'
              className='h-10 w-10 rounded-full object-cover'
            />
            <span className='text-xl font-semibold text-orange-700'>BamBoo Sông Chanh</span>
          </div>
        </Link>

        <div style={{ marginLeft: token?.marginLG }}>
          <MainNav />
        </div>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: token?.margin,
          }}
        >
          {!!user && <UserNav user={user} />}
          {!user && (
            <>
              <Link to='/login'>
                <Button
                  type='primary'
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: token?.colorPrimary,
                    borderColor: token?.colorPrimary,
                  }}
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link to='/register'>
                <Button
                  style={{
                    borderColor: token?.colorPrimary,
                    color: token?.colorPrimary,
                  }}
                >
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};