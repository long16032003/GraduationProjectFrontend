import React from 'react';
import { useSaveButton } from '@refinedev/core';
import { Button } from 'antd';
import type { SaveButtonProps } from '@refinedev/antd';

/**
 * `<SaveButton>` uses Ant Design's {@link https://ant.design/components/button/ `<Button>`} component.
 * It uses it for presantation purposes only. Some of the hooks that refine has adds features to this button.
 *
 * @see {@link https://refine.dev/docs/api-reference/antd/components/buttons/save-button} for more details.
 */
export const SaveButton: React.FC<SaveButtonProps> = ({ hideText = false, children, ...rest }) => {
  const { label } = useSaveButton();

  return (
    <Button
      type='primary'
      className={`b-save-button`}
      {...rest}
    >
      {!hideText && (children ?? label)}
    </Button>
  );
};
