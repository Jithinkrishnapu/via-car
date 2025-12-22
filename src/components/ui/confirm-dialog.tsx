import React from "react";
import { View } from "react-native";
import Dialog from "./dialog";
import Text from "../common/text";

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "default" | "destructive";
  confirmDisabled?: boolean;
}

const ConfirmDialog = ({
  visible,
  onClose,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "default",
  confirmDisabled = false,
}: ConfirmDialogProps) => {
  const getButtonColor = () => {
    if (confirmDisabled) return "bg-gray-400";
    return type === "destructive" ? "bg-red-500" : "bg-[#FF4848]";
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton={true}
      showButtons={true}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmDisabled={confirmDisabled}
      closeOnBackdrop={true}
    >
      <View className="py-2">
        <Text className="text-[16px] font-[Kanit-Light] text-center text-gray-700 leading-6">
          {message}
        </Text>
      </View>
    </Dialog>
  );
};

export default ConfirmDialog;