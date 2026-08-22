import { View } from "react-native";
import { colors } from "../tokens/colors";

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, width: "100%" }} />;
}
