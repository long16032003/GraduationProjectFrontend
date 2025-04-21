import { Button } from 'antd';

export function PageHeader() {
  return (
      <div className="sticky top-12 flex justify-between items-center gap-2 border-b bg-background z-10 py-2 h-14">
        <h2 className="text-lg font-semibold">Products</h2>
        <div className="ml-auto flex w-full space-x-2 justify-end">
          <Button>Cancel</Button>
          <Button type="primary">Submit</Button>
        </div>
      </div>
  );
}