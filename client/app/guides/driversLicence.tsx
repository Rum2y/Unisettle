import { View, Text, ScrollView } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type SectionContentItem = {
  type?: string;
  purpose?: string;
  notes?: string;
  subtitle?: string;
  countries?: string[];
  requirements?: string[];
  steps?: string[];
  rules?: string[];
  tips?: string[];
};

type Section = {
  title: string;
  content: SectionContentItem[];
};

const DriversLicence = ({ sections }: { sections: any[] }) => {
  return (
    <ScrollView className="flex-1 bg-white p-4" style={{ paddingBottom: 40 }}>
      <Text className="text-2xl font-bold text-teal-800 mb-6 text-center">
        Alberta Driver's License Guide
      </Text>

      {sections.map((section, index) => (
        <View key={index} className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-xl font-bold text-teal-700 mb-4">
            {section.title}
          </Text>

          {section.content.map((item: any, itemIndex: number) => (
            <View key={itemIndex}>
              {/* License Types Table - Only for first section */}
              {item.type && item.purpose && (
                <View className="py-3 border-b border-gray-100 gap-2">
                  <View className="flex-1">
                    <Text className="font-bold text-teal-800">{item.type}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 font-bold">
                      {item?.purpose}
                    </Text>
                  </View>
                  <View className="flex-2">
                    <Text className="text-gray-600">{item.notes}</Text>
                  </View>
                </View>
              )}

              {/* Countries List */}
              {item.countries && (
                <View className="mb-4">
                  {item.subtitle && (
                    <Text className="font-medium text-teal-700 mb-2">
                      {item.subtitle}
                    </Text>
                  )}
                  <View className="flex-row flex-wrap">
                    {item.countries.map((country: string, i: number) => (
                      <View
                        key={i}
                        className="bg-teal-100 px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        <Text className="text-teal-800">{country}</Text>
                      </View>
                    ))}
                  </View>
                  {item.requirements && (
                    <View className="mt-4">
                      <Text className="font-medium text-teal-700 mb-2">
                        Required Documents:
                      </Text>
                      {item.requirements.map(
                        (req: string, reqIndex: number) => (
                          <View
                            key={reqIndex}
                            className="flex-row items-start mb-2"
                          >
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#0d9488"
                              style={{ marginRight: 8, marginTop: 3 }}
                            />
                            <Text className="text-gray-700 flex-1">{req}</Text>
                          </View>
                        )
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Steps */}
              {item.steps && (
                <View className="mb-4">
                  {item.when && (
                    <Text className="font-medium text-teal-700 mb-2">
                      When: {item.when}
                    </Text>
                  )}
                  <Text className="font-medium text-teal-700 mb-2">Steps:</Text>
                  {item.steps.map((step: string, stepIndex: number) => (
                    <View key={stepIndex} className="flex-row items-start mb-2">
                      <Text className="text-teal-600 font-bold mr-2">
                        {stepIndex + 1}.
                      </Text>
                      <Text className="text-gray-700 flex-1">{step}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Rules */}
              {item.rules && (
                <View className="mb-4">
                  <Text className="font-medium text-teal-700 mb-2">Rules:</Text>
                  {item.rules.map((rule: string, ruleIndex: number) => (
                    <View key={ruleIndex} className="flex-row items-start mb-2">
                      <Ionicons
                        name="alert-circle"
                        size={16}
                        color="#f59e0b"
                        style={{ marginRight: 8, marginTop: 3 }}
                      />
                      <Text className="text-gray-700 flex-1">{rule}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Locations */}
              {item.locations && (
                <View className="mb-4">
                  <Text className="font-medium text-teal-700 mb-2">
                    Locations:
                  </Text>
                  {item.locations.map((location: string, locIndex: number) => (
                    <View key={locIndex} className="flex-row items-start mb-2">
                      <Ionicons
                        name="location"
                        size={16}
                        color="#0d9488"
                        style={{ marginRight: 8, marginTop: 3 }}
                      />
                      <Text className="text-gray-700 flex-1">{location}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Items (for Required Documents) */}
              {item.items && (
                <View className="mb-4">
                  <Text className="font-medium text-teal-700 mb-2">
                    Required Items:
                  </Text>
                  {item.items.map((docItem: string, docIndex: number) => (
                    <View key={docIndex} className="flex-row items-start mb-2">
                      <Ionicons
                        name="document-text"
                        size={16}
                        color="#0d9488"
                        style={{ marginRight: 8, marginTop: 3 }}
                      />
                      <Text className="text-gray-700 flex-1">{docItem}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Tips */}
              {item.tips && (
                <View className="mt-4">
                  <Text className="font-medium text-teal-700 mb-2">
                    Pro Tips:
                  </Text>
                  {item.tips.map((tip: string, tipIndex: number) => (
                    <View
                      key={tipIndex}
                      className="flex-row items-start mb-2 bg-teal-50 p-3 rounded-lg"
                    >
                      <Ionicons
                        name="bulb"
                        size={16}
                        color="#0d9488"
                        style={{ marginRight: 8, marginTop: 3 }}
                      />
                      <Text className="text-teal-800 flex-1">{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default DriversLicence;
