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
  ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker  from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Assets } from '@react-navigation/elements';
import { router } from 'expo-router';
import { handleVerifyId } from '@/service/auth';

const UploadDocumentsScreen = () => {
  const [nationalId, setNationalId] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [drivingLicense, setDrivingLicense] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [vehicleRegistration, setVehicleRegistration] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [carPlateNumber, setCarPlateNumber] = useState('');
  const [carSequenceNumber, setCarSequenceNumber] = useState('');
  const [nationalIdnum, setNationalIdnum] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Request camera permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload documents.');
      return false;
    }
    return true;
  };

  // Handle document upload
  const handleDocumentUpload = async (documentType: string) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // For National ID, we'll use ImagePicker since it's shown as an image
      if (documentType === 'nationalId') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          setNationalId(result.assets[0] as ImagePicker.ImagePickerAsset);
        }
      } else {
        // For other documents, use DocumentPicker
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled) {
          if (documentType === 'drivingLicense') {
            setDrivingLicense(result.assets[0]);
          } else if (documentType === 'vehicleRegistration') {
            setVehicleRegistration(result.assets[0]);
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
      console.error('Document upload error:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!nationalId) {
      Alert.alert('Required', 'Please upload your National ID');
      return;
    }
    if (!carPlateNumber.trim()) {
      Alert.alert('Required', 'Please enter car plate number');
      return;
    }
    if (!carSequenceNumber.trim()) {
      Alert.alert('Required', 'Please enter car sequence number');
      return;
    }
    if (!drivingLicense) {
      Alert.alert('Required', 'Please upload your driving license');
      return;
    }
    if (!vehicleRegistration) {
      Alert.alert('Required', 'Please upload vehicle registration');
      return;
    }

    setIsLoading(true);
    const formdata = new FormData()
    formdata.append("national_id_number",nationalIdnum)
    formdata.append("car_plate_number",carPlateNumber)
    formdata.append("sequence_number",carSequenceNumber)
    formdata.append("driving_license", {
      uri: drivingLicense.uri,
      type: drivingLicense.mimeType || 'application/octet-stream',
      name: drivingLicense.name || 'driving_license'
    } as any)
    formdata.append("vehicle_registration", {
      uri: vehicleRegistration.uri,
      type: vehicleRegistration.mimeType || 'application/octet-stream',
      name: vehicleRegistration.name || 'vehicle_registration'
    } as any)
    formdata.append("national_id", {
      uri: nationalId.uri,
      type: nationalId.type || 'image/jpeg',
      name: 'national_id.jpg'
    } as any)
    console.log("sheeet==========",JSON.stringify(formdata))
    
    const response = await handleVerifyId(formdata)
    console.log("response============",response)
    if(response?.ok){
      router.push("/book")
      Alert.alert('Success', 'Documents uploaded successfully!', [
        { text: 'OK', onPress: () => console.log('Documents submitted') }
      ]);
      setIsLoading(false)
    }else{
      Alert.alert('Error', 'Documents not uploaded!', [
        { text: 'OK', onPress: () => console.log('Documents not submitted') }
      ]);
      setIsLoading(false)
    }
  };

  return (
    <SafeAreaView className="flex-1 py-3 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Header */}
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Upload Documents
          </Text>

          {/* National ID Section */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              National ID
            </Text>
            <TextInput
              value={nationalIdnum}
              onChangeText={setNationalIdnum}
              placeholder="Enter Here"
              className="border border-gray-300 mb-2 rounded-lg px-4 py-3 text-gray-900"
              placeholderTextColor="#9ca3af"
            />

            <Text className="text-sm text-gray-600 mb-3">
              Upload National ID
            </Text>

            {nationalId ? (
              <View className="relative">
                <Image 
                  source={{ uri: nationalId.uri }} 
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  onPress={() => setNationalId(null)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1"
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => handleDocumentUpload('nationalId')}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center"
              >
                <Ionicons name="camera-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-2">Tap to upload</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Car Plate Number */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              Car Plate Number
            </Text>
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
            <Text className="text-base font-semibold text-gray-900 mb-2">
              Car Sequence Number
            </Text>
            <TextInput
              value={carSequenceNumber}
              onChangeText={setCarSequenceNumber}
              placeholder="Enter Here"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Upload Driving License */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Upload Driving License
            </Text>
            <TouchableOpacity 
              onPress={() => handleDocumentUpload('drivingLicense')}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 items-center"
            >
              {drivingLicense ? (
                <View className="items-center">
                  <Ionicons name="document-text" size={48} color="#10b981" />
                  <Text className="text-green-600 mt-2 text-center">
                    {drivingLicense.name || 'Document uploaded'}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">Tap to change</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">Tap to upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Upload Vehicle Registration */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Upload Vehicle Registration
            </Text>
            <TouchableOpacity 
              onPress={() => handleDocumentUpload('vehicleRegistration')}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 items-center"
            >
              {vehicleRegistration ? (
                <View className="items-center">
                  <Ionicons name="document-text" size={48} color="#10b981" />
                  <Text className="text-green-600 mt-2 text-center">
                    {vehicleRegistration.name || 'Document uploaded'}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">Tap to change</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">Tap to upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`${
              isLoading ? 'bg-red-300' : 'bg-red-500'
            } rounded-full py-4 px-8 mb-6`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Submit
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UploadDocumentsScreen;