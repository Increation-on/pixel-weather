import { TouchableOpacity, Text, Image, View } from "react-native"

interface SearchButtonProps {
    handleSearchPress: () => void;
    isOffline: boolean;
    userCity: string | null | undefined;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ handleSearchPress, isOffline, userCity }) => {
    return (
        <TouchableOpacity
            className="flex-row items-center bg-card border-2 border-gray-800 px-4 py-3 mb-4 active:opacity-80 mt-6"
            onPress={handleSearchPress}
            disabled={isOffline}
            activeOpacity={0.7}
        >
            <Text className="text-text-secondary font-pixel text-[10px] flex-1">
                {userCity ? `Искать другой город` : 'Выбрать город вручную'}
            </Text>

            <View className="absolute right-0 top-0 bottom-0 w-12 bg-primary/70 border-l-2 border-gray-800 items-center justify-center">
        <Image
          source={require('@/assets/icons/search.png')}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
      </View>

        </TouchableOpacity>
    )
}