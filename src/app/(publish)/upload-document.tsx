import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { handleVerifyId } from '@/service/auth';

const UploadDocumentsScreen = () => {
  const [nationalId, setNationalId] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [drivingLicense, setDrivingLicense] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [vehicleRegistration, setVehicleRegistration] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [carPlateNumber, setCarPlateNumber] = useState('');
  const [carSequenceNumber, setCarSequenceNumber] = useState('');
  const [nationalIdnum, setNationalIdnum] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<string>('');

  const requestPermissions = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant gallery permissions to upload documents.');
        return false;
      }
    }
    return true;
  };

  const openBottomSheet = (documentType: string) => {
    setCurrentDocumentType(documentType);
    setShowBottomSheet(true);
  };

  const handleCamera = async () => {
    setShowBottomSheet(false);
    
    // Small delay to ensure modal is closed before camera opens
    await new Promise(resolve => setTimeout(resolve, 300));

    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) {
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (currentDocumentType === 'nationalId') setNationalId(asset);
        else if (currentDocumentType === 'drivingLicense') setDrivingLicense(asset as any);
        else if (currentDocumentType === 'vehicleRegistration') setVehicleRegistration(asset as any);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      Alert.alert(
        'Camera Error', 
        Platform.OS === 'android' 
          ? 'Camera not available. If using an emulator, please use "Choose from Gallery" instead.'
          : 'Failed to open camera. Please try again.'
      );
    }
  };

  const handleGallery = async () => {
    setShowBottomSheet(false);
    
    // Small delay to ensure modal is closed before gallery opens
    await new Promise(resolve => setTimeout(resolve, 300));

    const hasPermission = await requestPermissions('gallery');
    if (!hasPermission) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (currentDocumentType === 'nationalId') setNationalId(asset);
        else if (currentDocumentType === 'drivingLicense') setDrivingLicense(asset as any);
        else if (currentDocumentType === 'vehicleRegistration') setVehicleRegistration(asset as any);
      }
    } catch (error: any) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!nationalId) return Alert.alert('Required', 'Please upload your National ID');
    if (!carPlateNumber.trim()) return Alert.alert('Required', 'Please enter car plate number');
    if (!carSequenceNumber.trim()) return Alert.alert('Required', 'Please enter car sequence number');
    if (!drivingLicense) return Alert.alert('Required', 'Please upload your driving license');
    if (!vehicleRegistration) return Alert.alert('Required', 'Please upload vehicle registration');

    setIsLoading(true);
    const formdata = new FormData();
    formdata.append('national_id_number', nationalIdnum);
    formdata.append('car_plate_number', carPlateNumber);
    formdata.append('sequence_number', carSequenceNumber);

    try {
      formdata.append('national_id', {
        uri: nationalId.uri,
        name: 'national_id.jpg',
        type: nationalId.mimeType || 'image/jpeg',
      } as any);

      formdata.append('driving_license', {
        uri: drivingLicense.uri,
        name: drivingLicense.name || 'driving_license.jpg',
        type: drivingLicense.mimeType || 'image/jpeg',
      } as any);

      formdata.append('vehicle_registration', {
        uri: vehicleRegistration.uri,
        name: vehicleRegistration.name || 'vehicle_registration.jpg',
        type: vehicleRegistration.mimeType || 'image/jpeg',
      } as any);

      const response = await handleVerifyId(formdata);
      const body = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Documents uploaded successfully!');
        router.replace('/pending-verification');
      } else {
        Alert.alert('Error', body.message || 'Documents not uploaded!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while uploading.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* ---------- keyboard avoiding wrapper ---------- */}
      <View className="px-6 mt-5 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Upload Documents</Text>
      </View>

      {/* ---------- keyboard avoiding wrapper ---------- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustsScrollIndicatorInsets={false}
        >
          {/* National ID */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">National ID</Text>
            <TextInput
              value={nationalIdnum}
              onChangeText={setNationalIdnum}
              placeholder="Enter Here"
              className="border border-gray-300 mb-2 rounded-lg px-4 py-3 text-gray-900"
              placeholderTextColor="#9ca3af"
            />
            <Text className="text-sm text-gray-600 mb-3">Upload National ID</Text>
            {nationalId ? (
              <View className="relative">
                <Image source={{ uri: nationalId.uri }} className="w-full h-48 rounded-lg" resizeMode="cover" />
                <TouchableOpacity onPress={() => setNationalId(null)} className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => openBottomSheet('nationalId')} className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center">
                <Ionicons name="camera-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-2">Tap to upload</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Car Plate Number */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">Car Plate Number</Text>
            <TextInput
              value={carPlateNumber}
              onChangeText={setCarPlateNumber}
              placeholder="Enter Here"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Car Sequence Number */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">Car Sequence Number</Text>
            <TextInput
              value={carSequenceNumber}
              onChangeText={setCarSequenceNumber}
              placeholder="Enter Here"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Driving License */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">Upload Driving License</Text>
            {drivingLicense ? (
              <View className="relative">
                <Image source={{ uri: drivingLicense.uri }} className="w-full h-48 rounded-lg" resizeMode="cover" />
                <TouchableOpacity onPress={() => setDrivingLicense(null)} className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => openBottomSheet('drivingLicense')} className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center">
                <Ionicons name="camera-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-2">Tap to upload</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Vehicle Registration */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-gray-900 mb-3">Upload Vehicle Registration</Text>
            {vehicleRegistration ? (
              <View className="relative">
                <Image source={{ uri: vehicleRegistration.uri }} className="w-full h-48 rounded-lg" resizeMode="cover" />
                <TouchableOpacity onPress={() => setVehicleRegistration(null)} className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => openBottomSheet('vehicleRegistration')} className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center">
                <Ionicons name="camera-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-2">Tap to upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- fixed footer ---------- */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          className={`${isLoading ? 'bg-red-300' : 'bg-red-500'} rounded-full py-4 px-8`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">Submit</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ---------- bottom sheet modal ---------- */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowBottomSheet(false)}
        >
          <View className="flex-1 justify-end">
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-white rounded-t-3xl px-6 py-6">
                <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
                
                <Text className="text-xl font-bold text-gray-900 mb-4">Upload Document</Text>
                
                <TouchableOpacity
                  onPress={handleCamera}
                  className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3"
                >
                  <View className="bg-red-100 rounded-full p-3 mr-4">
                    <Ionicons name="camera" size={24} color="#ef4444" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleGallery}
                  className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3"
                >
                  <View className="bg-red-100 rounded-full p-3 mr-4">
                    <Ionicons name="images" size={24} color="#ef4444" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">Choose from Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowBottomSheet(false)}
                  className="bg-gray-200 rounded-xl p-4 mt-2"
                >
                  <Text className="text-base font-semibold text-gray-700 text-center">Cancel</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default UploadDocumentsScreen;