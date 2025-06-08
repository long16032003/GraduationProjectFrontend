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
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </Content>
    </Layout>
  );
};