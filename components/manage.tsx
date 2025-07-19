import {
  View,
  Text,
  Pressable,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button } from "react-native-paper";
import { LinearGradientComponent } from "@/components/gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BusinessCards from "@/components/businessCards";

type Business = {
  $id: string;
};

type ManageProps = {
  businesses: Business[];
  loading: boolean;
  isDeleting?: boolean;
  deleteAllBusinesses?: () => void;
  confirmDelete?: (id: string) => void;
  edit: boolean;
  handleRemoveFromState?: (id: string) => void;
  condition: boolean;
  more: boolean;
  refresh: () => void;
  refreshTrigger: boolean;
};

const Manage: React.FC<ManageProps> = ({
  businesses,
  loading,
  isDeleting,
  deleteAllBusinesses,
  confirmDelete,
  edit,
  handleRemoveFromState,
  condition,
  more,
  refresh,
  refreshTrigger,
}) => {
  return (
    <View className="flex-1 bg-white">
      <LinearGradientComponent />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-4">
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.$id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshTrigger}
                onRefresh={refresh}
                colors={["#0d9488"]} // Android spinner colors
                tintColor="#0d9488" // iOS spinner color
              />
            }
            renderItem={({ item, index }) => (
              <View className="mb-6 rounded-2xl p-2">
                <BusinessCards
                  biz={item}
                  idx={index}
                  manage={more}
                  deleteBookmark={condition ? handleRemoveFromState : undefined}
                />

                {edit && (
                  <View className="flex-row justify-end gap-2">
                    {/* Edit Button */}
                    <TouchableOpacity
                      onPress={() => router.push(`/businesses/${item.$id}`)}
                      activeOpacity={0.8}
                      className="px-4 py-2 rounded-full flex-row items-center"
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#005965"
                      />
                      <Text className="text-[#005965] font-medium ml-2">
                        Edit
                      </Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={() => confirmDelete && confirmDelete(item.$id)}
                      activeOpacity={0.8}
                      className="bg-red-100 px-4 py-2 rounded-full flex-row items-center"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <Text className="text-[#EF4444] font-medium ml-2">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            ListHeaderComponent={() => (
              <View className="px-4 pt-6 pb-2">
                <Text className="text-2xl font-bold text-[#005965]">
                  {edit ? "Manage Your Businesses" : "Your Bookmarks"}
                </Text>
              </View>
            )}
            ListFooterComponent={() =>
              edit ? (
                <View className="mt-6 px-4">
                  <Button
                    mode="outlined"
                    onPress={deleteAllBusinesses}
                    loading={isDeleting}
                    disabled={isDeleting}
                    textColor="#FF3B30"
                    style={{
                      borderColor: "#FF3B30",
                      borderWidth: 1.5,
                      borderRadius: 999,
                      paddingVertical: 8,
                      marginBottom: 30,
                    }}
                    contentStyle={{
                      paddingVertical: 6,
                    }}
                  >
                    {isDeleting ? "Deleting..." : "Delete All Businesses"}
                  </Button>
                </View>
              ) : null
            }
            ListEmptyComponent={() =>
              loading ? (
                <View className="flex-1 justify-center items-center mt-10">
                  <ActivityIndicator size="large" color="#005965" />
                </View>
              ) : (
                <View className="flex-1 justify-center items-center mt-10">
                  <Ionicons
                    name="business-outline"
                    size={64}
                    color="#9ca3af"
                    style={{ marginBottom: 16 }}
                  />
                  <Text className="text-lg font-medium text-gray-500 mb-1 text-center">
                    No businesses found
                  </Text>
                  <Pressable
                    onPress={() => router.push("/businesses/addBusiness")}
                    className="mt-4 px-6 py-2 bg-teal-100 rounded-full"
                  >
                    <Text className="text-teal-700 font-medium">
                      Add Business
                    </Text>
                  </Pressable>
                </View>
              )
            }
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Manage;
