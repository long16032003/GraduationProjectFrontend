import { cn } from '@/lib/utils.ts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { GalleryVerticalEnd } from 'lucide-react';
import React from 'react';
import { Link } from '@refinedev/core';
import { RegisterForm } from '@/pages/auth/register/form.tsx';

export function RegisterPage({
                                    className,
                                    ...props
                                  }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <a href="#" className="flex items-center gap-2 self-center font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        Acme Inc.
      </a>
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <RegisterForm />
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link className="underline underline-offset-4" to="/login">Log in</Link>
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