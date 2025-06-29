import React, { useState } from 'react';
import { useDeleteButton } from '@refinedev/core';
import { Button, Modal, Popconfirm } from 'antd';
import type { DeleteButtonProps } from '@refinedev/antd';
import type { ButtonProps } from 'antd/es/button/button';

const okButtonProps: ButtonProps = {
  variant: 'solid',
  color: 'danger',
};

/**
 * `<DeleteButton>` uses Ant Design's {@link https://ant.design/components/button/ `<Button>`} and {@link https://ant.design/components/button/ `<Popconfirm>`} components.
 * When you try to delete something, a pop-up shows up and asks for confirmation. When confirmed it executes the `useDelete` method provided by your `dataProvider`.
 *
 * @see {@link https://refine.dev/docs/api-reference/antd/components/buttons/delete-button} for more details.
 */
export const DeleteButton: React.FC<DeleteButtonProps> = (props) => {
  const {
    resource: resourceNameFromProps,
    recordItemId,
    onSuccess,
    mutationMode: mutationModeProp,
    children,
    successNotification,
    errorNotification,
    hideText = false,
    accessControl,
    meta,
    dataProviderName,
    confirmTitle,
    confirmOkText,
    confirmCancelText,
    invalidates,
    ...rest
  } = props;

  const {
    title,
    label,
    hidden,
    disabled,
    loading,
    confirmTitle: defaultConfirmTitle,
    confirmOkLabel: defaultConfirmOkLabel,
    cancelLabel: defaultCancelLabel,
    onConfirm,
  } = useDeleteButton({
    resource: resourceNameFromProps,
    id: recordItemId,
    dataProviderName,
    invalidates,
    meta,
    onSuccess,
    mutationMode: mutationModeProp,
    errorNotification,
    successNotification,
    accessControl,
  });

  const isDisabled = disabled || rest.disabled;
  const isHidden = hidden || rest.hidden;
  const [open, setOpen] = useState(false);

  if (isHidden) return null;

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };

  return (
    <>
      <Button
        danger
        title={title}
        disabled={isDisabled || loading}
        className={`b-delete-button`}
        onClick={showModal}
        {...rest}
      >
        {!hideText && (children ?? label)}
      </Button>

      <Modal
        key="delete"
        title="Delete Confirmation"
        open={open}
        onOk={onConfirm}
        confirmLoading={loading}
        onCancel={handleCancel}
        okText={confirmOkText ?? defaultConfirmOkLabel}
        cancelText={confirmCancelText ?? defaultCancelLabel}
        okButtonProps={okButtonProps}
      >
        <p>{confirmTitle ?? defaultConfirmTitle}</p>
      </Modal>
    </>
  );
};
