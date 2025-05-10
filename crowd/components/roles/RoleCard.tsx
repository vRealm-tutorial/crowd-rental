import { COLOR_SCHEME, UserRoles } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text } from "react-native";
import { TouchableOpacity, View } from "react-native";

interface RoleCardProps {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  role: UserRoles;
  selectedRole: UserRoles | null;
  onSelect: (role: UserRoles) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  iconName,
  role,
  selectedRole,
  onSelect,
}) => (
  <TouchableOpacity
    style={[styles.roleCard, selectedRole === role && styles.selectedRoleCard]}
    onPress={() => onSelect(role)}
  >
    <View style={styles.iconContainer}>
      <Ionicons name={iconName} size={28} color={COLOR_SCHEME.PRIMARY} />
    </View>
    <View style={styles.roleInfo}>
      <Text
        style={[
          styles.roleTitle,
          selectedRole === role && styles.selectedRoleTitle,
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.roleDescription,
          selectedRole === role && styles.selectedRoleDescription,
        ]}
      >
        {description}
      </Text>
    </View>
    <View style={styles.checkmark}>
      {selectedRole === role && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={COLOR_SCHEME.WHITE}
        />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLOR_SCHEME.LIGHT,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLOR_SCHEME.BORDER,
  },
  selectedRoleCard: {
    backgroundColor: COLOR_SCHEME.PRIMARY,
    borderColor: COLOR_SCHEME.PRIMARY,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLOR_SCHEME.WHITE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLOR_SCHEME.DARK,
    marginBottom: 5,
  },
  selectedRoleTitle: {
    color: COLOR_SCHEME.WHITE,
  },
  roleDescription: {
    fontSize: 14,
    color: COLOR_SCHEME.DARK,
    opacity: 0.8,
  },
  selectedRoleDescription: {
    color: COLOR_SCHEME.WHITE,
    opacity: 0.9,
  },
  checkmark: {
    width: 24,
    height: 24,
  },
});

export default RoleCard;
