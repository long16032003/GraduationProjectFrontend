import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGo } from '@refinedev/core';

interface NoPermissionProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const NoPermission: React.FC<NoPermissionProps> = ({
  title = "Không có quyền truy cập",
  message = "Bạn không có quyền để thực hiện hành động này. Vui lòng liên hệ quản trị viên để được cấp quyền.",
  showBackButton = true,
  onBack,
}) => {
  const go = useGo();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      go({ to: '/admin', options: { keepQuery: false } });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-red-100 p-3">
              <ShieldX className="h-6 w-6 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>

            {/* {showBackButton && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại trang chính
              </Button>
            )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 