import React from "react";
import { View } from "react-native";
import Dialog from "./dialog";
import Text from "../common/text";

interface AlertDialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  type?: "info" | "warning" | "error" | "success";
}

const AlertDialog = ({
  visible,
  onClose,
  title,
  message,
  confirmText = "OK",
  onConfirm,
  type = "info",
}: AlertDialogProps) => {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "success":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      showButtons={true}
      confirmText={confirmText}
      onConfirm={handleConfirm}
      closeOnBackdrop={false}
    >
      <View className="items-center py-4">
        <Text className="text-[32px] mb-4">{getIcon()}</Text>
        <Text className="text-[16px] font-[Kanit-Light] text-center text-gray-700 leading-6">
          {message}
        </Text>
      </View>
    </Dialog>
  );
};

export default AlertDialog;