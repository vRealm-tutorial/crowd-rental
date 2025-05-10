import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_SCHEME } from "../../constants";

const { width, height } = Dimensions.get("window");

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  headerIcon?: keyof typeof Ionicons.glyphMap;
  headerIconColor?: string;
  footerButtons?: Array<{
    text: string;
    onPress: () => void;
    type?: "primary" | "secondary" | "danger";
    disabled?: boolean;
    loading?: boolean;
  }>;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdropPress = true,
  headerIcon,
  headerIconColor = COLOR_SCHEME.PRIMARY,
  footerButtons = [],
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                {headerIcon && (
                  <Ionicons
                    name={headerIcon}
                    size={24}
                    color={headerIconColor}
                    style={styles.headerIcon}
                  />
                )}
                <Text style={styles.title}>{title}</Text>
                {showCloseButton && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={COLOR_SCHEME.DARK}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.content}>{children}</View>

              {footerButtons.length > 0 && (
                <View style={styles.footer}>
                  {footerButtons.map((button, index) => {
                    const buttonStyle = [
                      styles.footerButton,
                      button.type === "secondary" && styles.secondaryButton,
                      button.type === "danger" && styles.dangerButton,
                      index > 0 && { marginLeft: 10 },
                      button.disabled && styles.disabledButton,
                    ];

                    const textStyle = [
                      styles.buttonText,
                      button.type === "secondary" && styles.secondaryButtonText,
                      button.type === "danger" && styles.dangerButtonText,
                      button.disabled && styles.disabledButtonText,
                    ];

                    return (
                      <TouchableOpacity
                        key={index}
                        style={buttonStyle}
                        onPress={button.onPress}
                        disabled={button.disabled || button.loading}
                      >
                        <Text style={textStyle}>{button.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderRadius: 16,
    width: width * 0.85,
    maxHeight: height * 0.7,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLOR_SCHEME.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_SCHEME.BORDER,
  },
  headerIcon: {
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: height * 0.5,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLOR_SCHEME.BORDER,
    justifyContent: "flex-end",
  },
  footerButton: {
    flex: 1,
    backgroundColor: COLOR_SCHEME.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: COLOR_SCHEME.WHITE,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  dangerButton: {
    backgroundColor: COLOR_SCHEME.DANGER,
  },
  disabledButton: {
    backgroundColor: COLOR_SCHEME.BORDER,
    borderColor: COLOR_SCHEME.BORDER,
  },
  buttonText: {
    color: COLOR_SCHEME.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: COLOR_SCHEME.PRIMARY,
  },
  dangerButtonText: {
    color: COLOR_SCHEME.WHITE,
  },
  disabledButtonText: {
    color: COLOR_SCHEME.DARK,
    opacity: 0.5,
  },
});

export default CustomModal;
