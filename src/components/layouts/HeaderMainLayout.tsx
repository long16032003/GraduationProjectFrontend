import { Layout } from 'antd';
import { theme } from '@/config/theme';
import { MainHeader } from '../ui/main-header';

const { Content } = Layout;
const { token } = theme;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout style={{ 
      minHeight: '100vh',
    }}>
      <MainHeader />
      <Content>
        <div style={{ 
          maxWidth: 1200,
          margin: '0 auto',
          padding: `0 ${token?.padding}px`,
        }}>
          {children}
        </div>
      </Content>
    </Layout>
  );
};