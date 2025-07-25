import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PGWPSubsectionLink {
  label: string;
  link: string;
}

type PGWPSubsection = string | PGWPSubsectionLink;

interface PGWPSection {
  heading: string;
  body: string;
  subsections: PGWPSubsection[];
}

interface PGWPGuide {
  sections: PGWPSection[];
}

interface PGWPGuideScreenProps {
  pgwpGuide: PGWPGuide;
}

const PGWPGuideScreen: React.FC<PGWPGuideScreenProps> = ({ pgwpGuide }) => {
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open link:", err)
    );
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-3xl font-bold text-teal-800 mb-6">PGWP Guide</Text>

      {pgwpGuide.sections.map((section: PGWPSection, index: number) => (
        <View key={index} className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-teal-700 mb-3">
            {section.heading}
          </Text>

          {section.body && (
            <Text className="text-gray-700 mb-3">{section.body}</Text>
          )}

          {section.subsections && (
            <View className="mt-2">
              {section.subsections.map(
                (subsection: PGWPSubsection, subIndex: number) => {
                  if (typeof subsection === "string") {
                    return (
                      <View key={subIndex} className="flex-row mb-2">
                        <Ionicons
                          name="ellipse"
                          size={8}
                          color="#0d9488"
                          style={{ marginTop: 6, marginRight: 8 }}
                        />
                        <Text className="text-gray-700 flex-1">
                          {subsection}
                        </Text>
                      </View>
                    );
                  } else if (subsection.link) {
                    return (
                      <TouchableOpacity
                        key={subIndex}
                        onPress={() => openLink(subsection.link)}
                        className="flex-row items-center py-2"
                      >
                        <Ionicons
                          name="link"
                          size={16}
                          color="#0d9488"
                          style={{ marginRight: 8 }}
                        />
                        <Text className="text-teal-600 underline">
                          {subsection.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  return null;
                }
              )}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default PGWPGuideScreen;
