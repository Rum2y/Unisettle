import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface DropDownItem {
  id: number;
  name: string;
  dropdown: string[];
}

interface DropDownProps {
  array: DropDownItem[];
}

interface PriceRangeProps {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

const PriceRange = ({ placeholder, value, onChange }: PriceRangeProps) => (
  <TextInput
    placeholder={placeholder}
    placeholderTextColor="#999"
    keyboardType="numeric"
    value={value}
    onChangeText={onChange}
    className="border border-gray-300 p-3 mb-2 rounded"
  />
);

const DropDown = ({
  array,
  func,
}: DropDownProps & { func: (selections: string[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState<string[]>(
    new Array(array.length).fill("")
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // For price range inputs
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const OpenDropDown = (index: number) => {
    if (selectedIndex === index) {
      setOpen(false);
      setSelectedIndex(null);
    } else {
      setOpen(true);
      setSelectedIndex(index);
    }
  };

  const dropDownOption = (prop: string) => {
    if (selectedIndex === null) return;
    const newText = [...searchText];
    newText[selectedIndex] = prop;
    setSearchText(newText);
    setOpen(false);
    setSelectedIndex(null);
  };

  const confirmPriceRange = () => {
    if (selectedIndex === null) return;
    const formatted = `$${minPrice} – $${maxPrice}`;
    const newText = [...searchText];
    newText[selectedIndex] = formatted;
    setSearchText(newText);
    setOpen(false);
    setSelectedIndex(null);
    setMinPrice("");
    setMaxPrice("");
  };

  const SearchListings = () => {
    func(searchText);
  };
  return (
    <>
      <View className="p-4 bg-transparent">
        {array.map((item, index) => (
          <View key={index} className="mb-4">
            <TouchableOpacity
              className="bg-white p-4 rounded-xl shadow-sm"
              onPress={() => OpenDropDown(index)}
            >
              <Text>
                {item.name}: {searchText[index] || "Select"}
              </Text>
            </TouchableOpacity>

            <View
              className="mb-2"
              style={{
                display: open && selectedIndex === index ? "flex" : "none",
              }}
            >
              {/* Show options if not Price Range */}
              {item.id !== 10 && (
                <View className="border rounded-sm border-gray-300">
                  {item.dropdown.map((dropdownItem, dropdownIndex) => (
                    <TouchableOpacity
                      key={dropdownIndex}
                      className="bg-gray-100 p-4 border-b border-gray-300"
                      onPress={() => dropDownOption(dropdownItem)}
                      style={{
                        borderBottomWidth:
                          dropdownIndex === item.dropdown.length - 1 ? 0 : 1,
                      }}
                    >
                      <Text>{dropdownItem}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Special case: Price Range */}
              {item.id === 10 && (
                <View className="rounded-md border border-gray-300 p-3 bg-gray-50">
                  <PriceRange
                    placeholder="$Min CAD"
                    value={minPrice}
                    onChange={setMinPrice}
                  />
                  <PriceRange
                    placeholder="$Max CAD"
                    value={maxPrice}
                    onChange={setMaxPrice}
                  />
                  <TouchableOpacity
                    className="bg-primary p-3 rounded-lg mt-2"
                    onPress={confirmPriceRange}
                  >
                    <Text className="text-white text-center font-medium">
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
        <TouchableOpacity
          className="bg-teal-600 p-4 rounded-xl mt-4"
          onPress={SearchListings}
        >
          <Text className="text-white text-center font-medium">
            Search Listings
          </Text>
        </TouchableOpacity>
      </View>
      <Text className="text-sm text-[#999999] text-center mt-2">
        Enter filters to find housing options
      </Text>
    </>
  );
};

export default DropDown;
