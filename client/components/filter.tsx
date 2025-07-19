import { Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

type TextStyleProps = {
  selected?: string;
  unselected?: string;
};

type FiltersProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  func: () => void;
  selected: boolean;
  textStyle?: TextStyleProps;
};

const Filters = ({ icon, label, func, selected, textStyle }: FiltersProps) => {
  return (
    <Chip
      icon={() => (
        <Ionicons
          name={icon}
          size={18}
          color={
            selected
              ? `${textStyle?.selected || "white"}`
              : `${textStyle?.unselected || "black"}`
          }
        />
      )}
      mode={selected ? "flat" : "outlined"}
      textStyle={{
        color: selected
          ? `${textStyle?.selected || "white"}`
          : `${textStyle?.unselected || "black"}`,
      }}
      style={{
        backgroundColor: `${selected ? "#14b8a6" : "transparent"}`,
        borderColor: "#14b8a6",
        borderRadius: 15,
      }}
      onPress={func}
    >
      {label}
    </Chip>
  );
};

export default Filters;
