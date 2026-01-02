import React, { useState } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import Dialog from "./dialog";
import AlertDialog from "./alert-dialog";
import ConfirmDialog from "./confirm-dialog";
import Text from "../common/text";

// Example component showing how to use the dialog components
const DialogExamples = () => {
  const [showBasicDialog, setShowBasicDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <View className="p-6 gap-4">
      {/* Basic Dialog Example */}
      <TouchableOpacity
        onPress={() => setShowBasicDialog(true)}
        className="bg-blue-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center">Show Basic Dialog</Text>
      </TouchableOpacity>

      <Dialog
        visible={showBasicDialog}
        onClose={() => setShowBasicDialog(false)}
        title="Basic Dialog"
      >
        <Text className="text-center mb-4">
          This is a basic dialog with custom content.
        </Text>
        <TouchableOpacity
          onPress={() => setShowBasicDialog(false)}
          className="bg-[#FF4848] p-3 rounded-full"
        >
          <Text className="text-white text-center">Close Dialog</Text>
        </TouchableOpacity>
      </Dialog>

      {/* Alert Dialog Example */}
      <TouchableOpacity
        onPress={() => setShowAlertDialog(true)}
        className="bg-orange-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center">Show Alert Dialog</Text>
      </TouchableOpacity>

      <AlertDialog
        visible={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
        title="Alert"
        message="This is an important message that requires your attention."
        type="warning"
        confirmText="Got it"
      />

      {/* Confirm Dialog Example */}
      <TouchableOpacity
        onPress={() => setShowConfirmDialog(true)}
        className="bg-red-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center">Show Confirm Dialog</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="destructive"
        onConfirm={() => {
          console.log("Item deleted");
          setShowConfirmDialog(false);
        }}
      />

      {/* Form Dialog Example */}
      <TouchableOpacity
        onPress={() => setShowFormDialog(true)}
        className="bg-green-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center">Show Form Dialog</Text>
      </TouchableOpacity>

      <Dialog
        visible={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        title="Enter Information"
        showButtons={true}
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={() => {
          console.log("Saved:", inputValue);
          setInputValue("");
          setShowFormDialog(false);
        }}
        onCancel={() => {
          setInputValue("");
          setShowFormDialog(false);
        }}
        confirmDisabled={!inputValue.trim()}
      >
        <View className="py-2">
          <Text className="text-[14px] font-[Kanit-Light] text-gray-600 mb-3">
            Please enter some information:
          </Text>
          <View className="bg-[#F1F1F5] rounded-full px-4 h-[50px] justify-center">
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Type something..."
              placeholderTextColor="#999"
              className="text-[16px] font-[Kanit-Light]"
            />
          </View>
        </View>
      </Dialog>
    </View>
  );
};

export default DialogExamples;