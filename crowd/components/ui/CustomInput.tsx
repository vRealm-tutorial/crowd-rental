import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_SCHEME } from "../../constants";

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  onRightIconPress,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  ...rest
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={COLOR_SCHEME.DARK}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon && { paddingLeft: 35 },
            (rightIcon || isPassword) && { paddingRight: 40 },
            inputStyle,
          ]}
          placeholderTextColor={COLOR_SCHEME.DARK + "80"}
          secureTextEntry={isPassword && !passwordVisible}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            accessibilityHint="Toggles password visibility"
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color={COLOR_SCHEME.DARK}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel={`${label} action button`}
          >
            <Ionicons name={rightIcon} size={20} color={COLOR_SCHEME.DARK} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
    borderRadius: 8,
    height: 50,
    position: "relative",
  },
  inputError: {
    borderColor: COLOR_SCHEME.DANGER,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLOR_SCHEME.DARK,
  },
  leftIcon: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: 10,
    padding: 5, // Increase touchable area
  },
  errorText: {
    fontSize: 12,
    color: COLOR_SCHEME.DANGER,
    marginTop: 5,
  },
});

export default CustomInput;
