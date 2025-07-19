import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import DropDown from "../../components/dropdown";
import Gradient from "@/components/gradient";

const housing = () => {
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const selected = (selections: any[]) => {
    setSelectedFilters(selections);
  };

  useEffect(() => {
    if (selectedFilters.length > 0) {
      console.log("Selected filters:", selectedFilters);
      setLoading(true);
    }
  }, [selectedFilters]);

  const filters = [
    { name: "Price Range", id: 10, dropdown: [] },
    {
      name: "Bedrooms",
      id: 12,
      dropdown: [
        "1 Bedroom",
        "2 Bedrooms",
        "3 Bedrooms",
        "4 Bedrooms",
        "5 Bedrooms",
      ],
    },
    {
      name: "Bathrooms",
      id: 13,
      dropdown: [
        "1 Bathroom",
        "2 Bathrooms",
        "3 Bathrooms",
        "4 Bathrooms",
        "5 Bathrooms",
      ],
    },
    {
      name: "Type of rental",
      id: 14,
      dropdown: ["Apartment", "Shared Room", "Basement", "House"],
    },
  ];
  return (
    <Gradient styleContainer={{ height: "100%", paddingHorizontal: 16 }}>
      <Text className="text-xl font-bold mb-5 mt-6 text-black">
        Search Housing
      </Text>
      <DropDown array={filters} func={selected} />

      {loading && (
        <View className="mt-8 flex justify-center items-center">
          <ActivityIndicator size="large" color="teal" />
          <Text> </Text>
          <Text className="mt-3 text-sm text-gray-600 font-medium">
            Loading housing listings...
          </Text>
        </View>
      )}
    </Gradient>
  );
};

export default housing;
