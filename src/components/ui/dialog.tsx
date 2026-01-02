import React, { ReactNode } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import { X } from "lucide-react-native";
import Text from "../common/text";

const { height } = Dimensions.get("window");

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  height?: string | number;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  showButtons?: boolean;
  closeOnBackdrop?: boolean;
}

const Dialog = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  height: dialogHeight = "auto",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmDisabled = false,
  cancelDisabled = false,
  showButtons = false,
  closeOnBackdrop = true,
}: DialogProps) => {
  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <TouchableWithoutFeedback>
            <View
              className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden"
              style={{
                maxHeight: typeof dialogHeight === "string" ? "80%" : dialogHeight,
              }}
            >
              {/* Header */}
              <View className="relative px-6 pt-6 pb-4">
                {title && (
                  <Text className="text-[18px] font-[Kanit-Medium] text-center text-gray-900">
                    {title}
                  </Text>
                )}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.8}
                    className="absolute right-4 top-4 p-2"
                  >
                    <X color="#666666" size={20} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Content */}
              <View className="px-6 pb-6">
                {children}
              </View>

              {/* Action Buttons */}
              {showButtons && (
                <View className="px-6 pb-6 pt-2">
                  <View className="flex-row gap-3">
                    {onCancel && (
                      <TouchableOpacity
                        onPress={handleCancel}
                        disabled={cancelDisabled}
                        activeOpacity={0.8}
                        className={`flex-1 h-[50px] rounded-full border border-gray-300 items-center justify-center ${
                          cancelDisabled ? "opacity-50" : ""
                        }`}
                      >
                        <Text className="text-[16px] font-[Kanit-Regular] text-gray-700">
                          {cancelText}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onConfirm && (
                      <TouchableOpacity
                        onPress={onConfirm}
                        disabled={confirmDisabled}
                        activeOpacity={0.8}
                        className={`flex-1 h-[50px] rounded-full items-center justify-center ${
                          confirmDisabled
                            ? "bg-gray-400"
                            : "bg-[#FF4848]"
                        }`}
                      >
                        <Text className="text-[16px] font-[Kanit-Regular] text-white">
                          {confirmText}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Dialog;