import { View, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type GradientProps = {
  children: React.ReactNode;
  styleContainer?: object;
};

export const LinearGradientComponent = () => {
  return (
    <LinearGradient
      colors={["#E0F7FA", "#FFFFFF"]}
      style={StyleSheet.absoluteFillObject}
    />
  );
};

const Gradient = ({ children, styleContainer }: GradientProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {/* Gradient background behind all content */}
      <LinearGradientComponent />

      {/* Main content area with padding for safe area */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom,
          ...(styleContainer ? styleContainer : {}),
        }}
        style={{ flex: 1 }}
      >
        {children}
      </ScrollView>
    </View>
  );
};

export default Gradient;
