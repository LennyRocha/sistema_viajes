import { ReactNode } from "react";

export type DialogProps = {
  title: string;
  content: ReactNode;
  onClose: () => void | Promise<void>;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  showCloseButton?: boolean;
  confirmDisabled?: boolean;
  isLoading?: boolean;
};

export interface DialogProviderValues {
  showDialog: (props: DialogProps) => void;
  hideDialog: () => void;
}

export interface DialogProviderProps {
  children: ReactNode;
}
