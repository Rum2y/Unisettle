import {
  View,
  Text,
  Image,
  FlatList,
  Linking,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from "../context/auth-context";
import { useEffect, useState } from "react";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import Filters from "@/components/filter";
import ReviewsSection from "@/components/reviewsSection";
import {
  DATABASEID,
  GROCERYCOLLECTIONID,
  databases,
  STOREREVIEWSCOLLECTIONID,
} from "@/lib/appwrite";
import { Query } from "react-native-appwrite";

interface GroceryStore {
  $id: string;
  name: string;
  logo: string;
  type: string;
  info: string;
}

const Grocery = () => {
  const [groceryData, setGroceryData] = useState<any[] | null>(null);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGroceryData = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          DATABASEID,
          GROCERYCOLLECTIONID,
          filter === "All" ? [] : [Query.equal("type", filter)]
        );
        setGroceryData(response.documents);
        if (filterTypes.length === 0) {
          const uniqueTypes = Array.from(
            new Set(response.documents.map((store) => store.type))
          );
          setFilterTypes(uniqueTypes);
        }
      } catch (error) {
        console.error("Error fetching grocery data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroceryData();
  }, [filter]);

  return (
    <View className="flex-1 p-4">
      <View className="mb-4">
        <FlatList
          data={["All", ...filterTypes]}
          keyExtractor={(item, index) => index + item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ marginHorizontal: 6 }}>
              <Filters
                icon={item === "All" ? "apps" : "storefront"}
                label={item}
                func={() => {
                  setFilter(item);
                }}
                selected={filter === item}
                textStyle={{
                  selected: "white",
                  unselected: "teal",
                }}
              />
            </View>
          )}
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="teal" />
        </View>
      ) : (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <FlatList
            data={groceryData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item.name + index}
            renderItem={({ item }) => <GroceryCard store={item} />}
          />
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

/* Component to render each grocery store card */

function GroceryCard({ store }: { store: GroceryStore }) {
  const [allRatings, setAllRatings] = useState<Record<string, number>>({});

  const totalRating = (total: number, id: string) => {
    setAllRatings((prev) => ({ ...prev, [id]: total }));
  };

  const openGoogleMapsSearch = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.name
    )}`;

    Linking.openURL(url).catch((err) => {
      console.error("Failed to open Google Maps:", err);
      alert("Couldn't open Google Maps");
    });
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm shadow-neutral-200">
      {/* Logo + Name + Type */}
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: store.logo }}
          className="w-14 h-14 mr-3 rounded-md"
          resizeMode="contain"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold text-neutral-800">
            {store.name}
          </Text>
          <Text className="text-sm text-gray-500">{store.type}</Text>
        </View>
      </View>

      <View>
        <StarRatingDisplay
          rating={allRatings[store.$id ?? ""] || 0}
          color="teal"
          starStyle={{ marginHorizontal: 1 }}
          starSize={20}
          style={{ marginBottom: 10 }}
        />
      </View>

      {/* Info */}
      <Text className="text-sm text-gray-700">{store.info}</Text>

      {/* Simple Google Maps Link Button*/}
      <Button
        mode="text"
        onPress={openGoogleMapsSearch}
        icon="map"
        textColor="teal"
        compact
        style={{ alignSelf: "flex-start", marginLeft: -8 }}
      >
        Find on Google Maps
      </Button>

      <ReviewsSection
        DATABASEID={DATABASEID}
        COLLECTIONID={STOREREVIEWSCOLLECTIONID}
        data={store}
        func={totalRating}
      />
    </View>
  );
}

export default Grocery;
