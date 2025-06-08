import React from 'react';
import { Link } from "@refinedev/core";

export default function CustomerPasswordLabel () {
  return (
    <div className='b-formily-item-label justify-between'>
      <div className='b-formily-item-label-content flex justify-between w-full'>
        <div className='flex items-center flex-row'>
          <label>Mật khẩu</label>
        </div>
        <Link
          className='ml-auto text-sm text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline'
          to='/forgot-password'
        >
          Quên mật khẩu?
        </Link>
      </div>
    </div>
  );
}; 