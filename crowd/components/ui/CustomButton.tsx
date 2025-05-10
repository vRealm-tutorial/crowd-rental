import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_SCHEME } from "../../constants";

type ButtonType =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success"
  | "text";
type ButtonSize = "small" | "medium" | "large";

interface CustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  type = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
}) => {
  // Determine button styles based on type and size
  const getButtonStyle = () => {
    const baseStyle: StyleProp<ViewStyle> = [styles.button];

    // Add size styles
    switch (size) {
      case "small":
        baseStyle.push(styles.smallButton);
        break;
      case "large":
        baseStyle.push(styles.largeButton);
        break;
      default:
        baseStyle.push(styles.mediumButton);
    }

    // Add type styles
    switch (type) {
      case "secondary":
        baseStyle.push(styles.secondaryButton);
        break;
      case "outline":
        baseStyle.push(styles.outlineButton);
        break;
      case "danger":
        baseStyle.push(styles.dangerButton);
        break;
      case "success":
        baseStyle.push(styles.successButton);
        break;
      case "text":
        baseStyle.push(styles.textButton);
        break;
      default:
        baseStyle.push(styles.primaryButton);
    }

    // Add full width style if needed
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    // Add disabled style if needed
    if (disabled || loading) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  // Determine text styles based on type and size
  const getTextStyle = () => {
    const baseStyle: StyleProp<TextStyle> = [styles.buttonText];

    // Add size styles
    switch (size) {
      case "small":
        baseStyle.push(styles.smallButtonText);
        break;
      case "large":
        baseStyle.push(styles.largeButtonText);
        break;
      default:
        baseStyle.push(styles.mediumButtonText);
    }

    // Add type styles
    switch (type) {
      case "secondary":
        baseStyle.push(styles.secondaryButtonText);
        break;
      case "outline":
        baseStyle.push(styles.outlineButtonText);
        break;
      case "danger":
        baseStyle.push(styles.dangerButtonText);
        break;
      case "success":
        baseStyle.push(styles.successButtonText);
        break;
      case "text":
        baseStyle.push(styles.textButtonText);
        break;
      default:
        baseStyle.push(styles.primaryButtonText);
    }

    // Add disabled style if needed
    if (disabled || loading) {
      baseStyle.push(styles.disabledButtonText);
    }

    return baseStyle;
  };

  // Get icon color based on button type
  const getIconColor = () => {
    if (disabled || loading) {
      return COLOR_SCHEME.DARK + "40";
    }

    switch (type) {
      case "primary":
        return COLOR_SCHEME.WHITE;
      case "secondary":
        return COLOR_SCHEME.PRIMARY;
      case "outline":
        return COLOR_SCHEME.PRIMARY;
      case "danger":
        return COLOR_SCHEME.WHITE;
      case "success":
        return COLOR_SCHEME.WHITE;
      case "text":
        return COLOR_SCHEME.PRIMARY;
      default:
        return COLOR_SCHEME.WHITE;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            type === "outline" || type === "text"
              ? COLOR_SCHEME.PRIMARY
              : COLOR_SCHEME.WHITE
          }
          size={size === "small" ? "small" : "small"}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={size === "small" ? 16 : size === "large" ? 24 : 20}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={size === "small" ? 16 : size === "large" ? 24 : 20}
              color={getIconColor()}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  // Size styles
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // Type styles
  primaryButton: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLOR_SCHEME.LIGHT,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  dangerButton: {
    backgroundColor: COLOR_SCHEME.DANGER,
  },
  successButton: {
    backgroundColor: COLOR_SCHEME.SUCCESS,
  },
  textButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  // State styles
  disabledButton: {
    opacity: 0.6,
  },
  fullWidth: {
    width: "100%",
  },
  // Text styles
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  smallButtonText: {
    fontSize: 12,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },
  primaryButtonText: {
    color: COLOR_SCHEME.WHITE,
  },
  secondaryButtonText: {
    color: COLOR_SCHEME.PRIMARY,
  },
  outlineButtonText: {
    color: COLOR_SCHEME.PRIMARY,
  },
  dangerButtonText: {
    color: COLOR_SCHEME.WHITE,
  },
  successButtonText: {
    color: COLOR_SCHEME.WHITE,
  },
  textButtonText: {
    color: COLOR_SCHEME.PRIMARY,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
  // Icon styles
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default CustomButton;
