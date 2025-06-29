import React from 'react';
import { useExportButton } from '@refinedev/core';
import { Button } from 'antd';
import type { ExportButtonProps } from '@refinedev/antd';

/**
 * `<ExportButton>` is an Ant Design {@link https://ant.design/components/button/ `<Button>`} with a default export icon and a default text with "Export".
 * It only has presentational value.
 *
 * @see {@link https://refine.dev/docs/api-reference/antd/components/buttons/export-button} for more details.
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  hideText = false,
  children,
  ...rest
}) => {
  const { label } = useExportButton();

  return (
    <Button
      type='default'
      className={`b-export-button`}
      {...rest}
    >
      {!hideText && (children ?? label)}
    </Button>
  );
};
