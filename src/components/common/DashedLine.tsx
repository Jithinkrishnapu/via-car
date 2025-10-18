import { View } from "react-native";

const DashedLine = () => (
    <View className="flex-row justify-center py-2">
      {Array.from({ length: 30 }).map((_, i) => (
        <View key={i} className="w-1.5 h-0.5 bg-gray-400 mx-0.5 rounded-full" />
      ))}
    </View>
  );


  export default DashedLine