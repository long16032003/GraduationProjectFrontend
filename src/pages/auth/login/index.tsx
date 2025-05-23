import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { GalleryVerticalEnd } from 'lucide-react';
import { Link } from "@refinedev/core";
import LoginForm from './.form/LoginForm.tsx';

// https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/default/blocks/login-03
export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Link className="flex items-center gap-2 self-center font-medium" to="/">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        Acme Inc.
      </Link>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Login with your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <LoginForm />
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link className="underline underline-offset-4" to="/register"> Sign up</Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <div
          className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}