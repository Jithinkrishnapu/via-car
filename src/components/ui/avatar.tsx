import React, { useState } from "react";
import { View, Image, ImageSourcePropType } from "react-native";
import { twMerge } from "tailwind-merge";
import Text from "../common/text";

interface AvatarProps {
  source?: ImageSourcePropType;
  size?: number;
  initials?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  textClassName?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 32,
  initials = "",
  className = "",
  imageClassName = "",
  fallbackClassName = "",
  textClassName = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const containerClasses = twMerge(
    `overflow-hidden rounded-full items-center justify-center`,
    className
  );

  const imageClasses = twMerge(`w-full h-full object-cover`, imageClassName);

  const fallbackClasses = twMerge(
    `bg-gray-300 w-full h-full items-center justify-center`,
    fallbackClassName
  );

  const textClasses = twMerge(
    `text-white text-base font-[Kanit-Regular]`,
    textClassName
  );

  return (
    <View
      className={containerClasses}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      {source && !imageError ? (
        <Image
          source={source}
          className={imageClasses}
          onError={() => setImageError(true)}
        />
      ) : (
        <View className={fallbackClasses}>
          <Text fontSize={16} className={textClasses}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Avatar;
