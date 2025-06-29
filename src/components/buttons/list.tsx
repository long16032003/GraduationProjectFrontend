import React from 'react';
import { useListButton, useTranslate } from '@refinedev/core';
import { Button } from 'antd';
import type { ListButtonProps } from '@refinedev/antd';

/**
 * `<ListButton>` is using Ant Design's {@link https://ant.design/components/button/ `<Button>`} component.
 * It uses the  {@link https://refine.dev/docs/api-reference/core/hooks/navigation/useNavigation#list `list`} method from {@link https://refine.dev/docs/api-reference/core/hooks/navigation/useNavigation `useNavigation`} under the hood.
 * It can be useful when redirecting the app to the list page route of resource}.
 *
 * @see {@link https://refine.dev/docs/api-reference/antd/components/buttons/list-button} for more details.
 */
export const ListButton: React.FC<ListButtonProps> = ({
  resource: resourceNameFromProps,
  hideText = false,
  accessControl,
  meta,
  children,
  onClick,
  ...rest
}) => {
  const translate = useTranslate();

  const { to, label, title, hidden, disabled, LinkComponent } = useListButton({
    resource: resourceNameFromProps,
    meta,
    accessControl,
  });

  const isDisabled = disabled || rest.disabled;
  const isHidden = hidden || rest.hidden;

  if (isHidden) return null;

  return (
    <LinkComponent
      to={to}
      replace={false}
      onClick={(e: React.PointerEvent<HTMLButtonElement>) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        if (onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      <Button
        disabled={isDisabled}
        title={title}
        className={`b-list-button`}
        {...rest}
      >
        {!hideText && (children ?? translate(`Back to list`))}
      </Button>
    </LinkComponent>
  );
};
