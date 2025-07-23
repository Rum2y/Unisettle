import BusinessCards from "@/components/businessCards";
import Filters from "@/components/filter";
import { LinearGradientComponent } from "@/components/gradient";
import AuthModal from "@/components/modal";
import {
  BUSINESSESCOLLECTIONID,
  BUSINESSREVIEWSCOLLECTIONID,
  DATABASEID,
  databases,
} from "@/lib/appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import logBusinessEvent from "@/loggedEvents/loggedEvents";
import { router } from "expo-router";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Query } from "react-native-appwrite";
import { AnimatedFAB, Searchbar } from "react-native-paper";
import { categories } from "../businesses/[biz]";
import { useAuth } from "../context/auth-context";
import getImages from "../managebusiness/filePreview";

const business = () => {
  const [isExtended, setIsExtended] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [businesses, setBusinesses] = useState<any[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isIOS = Platform.OS === "ios";
  const { user, isBusinessSubscribed } = useAuth();

  const add = () => {
    setIsExtended(!isExtended);
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    //Check if already subscribed
    if (isExtended) {
      if (isBusinessSubscribed) router.push("/businesses/addBusiness");
      else router.push("/paymentPlans/paymentplan");
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const filters = [];

      if (selectedCategory !== "All") {
        filters.push(Query.equal("category", selectedCategory));
      }

      if (searchQuery.trim() !== "") {
        filters.push(
          Query.or([
            Query.search("name", searchQuery.trim()),
            Query.search("category", searchQuery.trim()),
          ])
        );
      }

      const response = await databases.listDocuments(
        DATABASEID,
        BUSINESSESCOLLECTIONID,
        filters
      );

      // Step 1: Fetch reviews and compute scores
      const businessesWithScores = await Promise.all(
        response.documents.map(async (biz) => {
          // Get preview images
          const images =
            biz.images && Array.isArray(biz.images)
              ? (await getImages(biz, true)).filter(Boolean)
              : [];

          // Fetch reviews for this business
          const reviewRes = await databases.listDocuments(
            DATABASEID,
            BUSINESSREVIEWSCOLLECTIONID,
            [Query.equal("storeid", biz.$id)]
          );

          const reviews = reviewRes.documents;
          const reviewCount = reviews.length;
          const avgRating =
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            (reviewCount || 1);

          // Optional: You can use a custom score formula here
          const score = avgRating * Math.log10(reviewCount + 1); // balanced

          return {
            ...biz,
            images,
            score,
          };
        })
      );

      // Step 2: Sort by score descending
      const sorted = businessesWithScores.sort((a, b) => b.score - a.score);

      setBusinesses(sorted);

      response.documents.forEach((biz) => {
        logBusinessEvent(biz.$id, "view", user?.$id);
      });
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory, searchQuery]);

  const onRefresh = async () => {
    setRefresh(true);
    await fetchBusinesses();
    setRefresh(false);
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 500),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchInput(text);
    debouncedSearch(text);
  };

  const headerComponent = useMemo(() => {
    return (
      <View className="mb-4">
        <Searchbar
          placeholder="Search for businesses"
          value={searchInput}
          onChangeText={handleSearchChange}
          inputStyle={{
            textAlignVertical: "center", // For Android
            minHeight: "100%",
            includeFontPadding: false,
          }}
          style={{
            marginVertical: 8,
            height: 48,
            backgroundColor: "white",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2, // Android shadow
          }}
        />
        <Categories
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </View>
    );
  }, [searchInput, selectedCategory]);

  return (
    <View className="flex-1 p-4 ">
      <LinearGradientComponent />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.$id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={onRefresh}
              colors={["#0d9488"]} // For Android: spinner color(s)
              tintColor="#0d9488" // For iOS: spinner color
            />
          }
          onScrollBeginDrag={() => {
            if (isExtended) setIsExtended(false);
          }}
          renderItem={({ item, index }) => (
            <BusinessCards
              biz={item}
              idx={index}
              refreshReviews={refresh}
              manage={true}
              userId={user?.$id}
            />
          )}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={() =>
            loading ? (
              <View className="flex-1 justify-center items-center mt-10">
                <ActivityIndicator animating={true} size="large" color="teal" />
              </View>
            ) : (
              <View className="flex-1 justify-center items-center mt-10 px-4">
                <MaterialCommunityIcons
                  name="store-remove-outline"
                  size={64}
                  color="#9ca3af"
                  style={{ marginBottom: 16 }}
                />
                <Text className="text-lg font-medium text-gray-500 mb-1 text-center">
                  No businesses found
                </Text>
                <Text className="text-sm text-gray-400 text-center">
                  {searchQuery || selectedCategory !== "All"
                    ? "Try adjusting your search or filters"
                    : "Be the first to add a business in your area!"}
                </Text>
                {!searchQuery && selectedCategory === "All" && (
                  <Pressable
                    onPress={add}
                    className="mt-4 px-6 py-2 bg-teal-100 rounded-full"
                  >
                    <Text className="text-teal-700 font-medium">
                      Add Business
                    </Text>
                  </Pressable>
                )}
              </View>
            )
          }
        />
      </KeyboardAvoidingView>
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <AnimatedFAB
        icon="plus"
        label="Add Business "
        extended={isExtended}
        onPress={add}
        animateFrom="right"
        iconMode="static"
        color="white"
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          backgroundColor: "teal",
          elevation: isIOS ? 0 : 6,
        }}
      />
    </View>
  );
};

type CategoriesProps = {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
};

const Categories = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoriesProps) => {
  return (
    <FlatList
      data={["All", ...categories]}
      keyExtractor={(item: string) => item}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }: { item: string }) => (
        <View className="mr-2">
          <Filters
            key={item}
            label={item}
            selected={item === selectedCategory}
            func={() => setSelectedCategory(item)}
          />
        </View>
      )}
    />
  );
};
export default business;
