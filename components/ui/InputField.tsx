import { Ionicons } from "@expo/vector-icons";
import { Box } from "./box";
import { Pressable, TextInput } from "react-native";
import { Text } from "./text";

const InputField = ({ icon, error, secure, toggleSecure, ...props }: any) => (
  <Box className="mb-4">
    <Box className="flex-row items-center border border-secondary-300 dark:border-typography-600 rounded-xl px-4">
      <Ionicons name={icon} size={20} color="#9ca3af" />
      <TextInput
        {...props}
        onChange={(e) => props.onChange(e.nativeEvent.text)}
        className="flex-1 p-3 ml-2 text-typography-900 dark:text-typography-50"
        placeholderTextColor="#9ca3af"
      />
      {toggleSecure && (
        <Pressable onPress={toggleSecure}>
          <Ionicons
            name={secure ? "eye-off" : "eye"}
            size={20}
            color="#9ca3af"
          />
        </Pressable>
      )}
    </Box>
    {error && <Text className="text-xs text-red-500 mt-1 ml-1">{error}</Text>}
  </Box>
);

export default InputField;
