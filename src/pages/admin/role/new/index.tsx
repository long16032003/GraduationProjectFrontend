import { cn } from '@/lib/utils.ts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import React from 'react';
import { Link, useList } from '@refinedev/core';
import { PageHeader } from '@/components/app/page-header.tsx';
import PermissionsForm from '@/pages/admin/role/PermissionList.tsx';
// import { useLoaderData } from 'react-router';
// import type { loader } from './loader';

// https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/default/blocks/login-03
export default function RoleNewPage() {

  // const data = useLoaderData() as Awaited<
  //   ReturnType<ReturnType<typeof loader>>
  // >

  // console.log(data)


  return (
    <>
      <PageHeader />
      <div className="'flex flex-col gap-6'">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Login with your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <PermissionsForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}