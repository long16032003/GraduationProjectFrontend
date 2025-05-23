import { Link } from "@refinedev/core";

export default function PasswordLabel () {
  return (
    <div className='b-formily-item-label'>
      <div className='b-formily-item-label-content flex justify-between w-full'>
        <div className='flex items-center flex-row'>
          <label>Password</label>
          {/*<span className={`b-formily-item-label-tooltip-icon`}>*/}
          {/*  <Tooltip placement="top" title={'Password must be at least 8 characters'}>*/}
          {/*    <QuestionCircleOutlined />*/}
          {/*  </Tooltip>*/}
          {/*</span>*/}
        </div>
        <Link
          className='ml-auto text-sm underline-offset-4 hover:underline'
          to='/forgot-password'
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
};