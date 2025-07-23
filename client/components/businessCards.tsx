import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Card, Button } from "react-native-paper";
import { useState } from "react";
import Carousel from "react-native-reanimated-carousel";
import logBusinessEvent from "@/loggedEvents/loggedEvents";
import { Ionicons } from "@expo/vector-icons";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import { BUSINESSREVIEWSCOLLECTIONID, DATABASEID } from "@/lib/appwrite";
import ReviewsSection from "./reviewsSection";
import Bookmark from "./bookmark";
import ImageView from "react-native-image-viewing";

interface ImageItem {
  uri: string;
}

interface Business {
  $id?: string;
  name?: string;
  category?: string;
  images?: string[];
  location?: string;
  phoneNumber?: string;
  instagram?: string;
  description?: string;
  city?: string;
  userID?: string;
}

const BusinessCards = ({
  biz,
  idx,
  refreshReviews,
  manage,
  deleteBookmark,
  userId,
  eventStats,
}: {
  biz: Business;
  idx: number;
  refreshReviews?: boolean;
  manage?: boolean;
  deleteBookmark?: (id: string) => void;
  userId?: string;
  eventStats?: { calls: number; instagram: number; views: number };
}) => {
  const [visible, setIsVisible] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [previewImages, setPreviewImages] = useState<ImageItem[]>([]);
  const [allRatings, setAllRatings] = useState<Record<string, number>>({});

  const totalRating = (total: number, id: string) => {
    setAllRatings((prev) => ({ ...prev, [id]: total }));
  };

  const screenWidth = Dimensions.get("window").width;

  const imagesForBusiness: ImageItem[] =
    biz.images?.map((uri: string) => ({ uri })) || [];

  return (
    <Card
      key={biz.$id || idx}
      style={{
        marginBottom: 16,
        backgroundColor: "white",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
      }}
    >
      {/* Image Gallery */}
      {manage && (
        <View
          style={{
            overflow: "hidden",
            height: 250,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <Carousel
            loop={imagesForBusiness.length > 1}
            width={screenWidth}
            height={250}
            autoPlayInterval={2000}
            autoPlay={imagesForBusiness.length > 1}
            data={imagesForBusiness}
            renderItem={({
              item,
              index,
            }: {
              item: ImageItem;
              index: number;
            }) => (
              <TouchableOpacity
                onPress={() => {
                  setIsVisible(true);
                  setPreviewImages(imagesForBusiness);
                  setIndex(index);
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={
                    item && item.uri
                      ? { uri: item.uri }
                      : { uri: "https://via.placeholder.com/300" }
                  }
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />

          <ImageView
            images={previewImages}
            imageIndex={index}
            visible={visible}
            onRequestClose={() => setIsVisible(false)}
            animationType="fade"
          />
        </View>
      )}

      <View style={{ padding: 16 }}>
        {/* Business Header */}
        <View className="flex-row items-center mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-neutral-800">
              {biz.name || "Business Name"}
            </Text>
            <Text className="text-sm text-neutral-600">
              {biz.category || "Category"}
            </Text>
          </View>
          {manage ? (
            <Bookmark
              data={biz}
              deleteBookmark={deleteBookmark}
              refreshTrigger={refreshReviews}
            />
          ) : (
            eventStats && (
              <View className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                <Text className="font-bold text-xs mb-2 text-teal-800 text-center">
                  Monthly Stats:
                </Text>
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={14} color="#0d9488" />
                    <Text className="text-xs text-teal-800 font-bold ml-1">
                      {eventStats.calls}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="eye-outline" size={14} color="#0d9488" />
                    <Text className="text-xs text-teal-800 font-bold ml-1">
                      {eventStats.views}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="logo-instagram" size={14} color="#0d9488" />
                    <Text className="text-xs text-teal-800 font-bold ml-1">
                      {eventStats.instagram}
                    </Text>
                  </View>
                </View>
              </View>
            )
          )}
        </View>

        {/* Rating */}
        <StarRatingDisplay
          rating={allRatings[biz.$id || ""] || 0}
          color="teal"
          starSize={20}
          starStyle={{ marginHorizontal: 1 }}
          style={{ marginBottom: 10 }}
        />

        {/* Key Details */}
        <View style={{ marginBottom: 16 }}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="map" size={16} color="#6b7280" />
            <Text style={{ marginLeft: 8, color: "#374151" }}>
              {`${biz.location}, ${biz.city}` || "Address"}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="call" size={16} color="#6b7280" />
            <Text style={{ marginLeft: 8, color: "#374151" }}>
              {biz.phoneNumber || "Phone"}
            </Text>
          </View>

          {biz.instagram !== "N/A" && (
            <View className="mb-2">
              <TouchableOpacity
                onPress={() => {
                  if (manage && userId) {
                    Linking.openURL(
                      `https://instagram.com/${
                        biz.instagram?.charAt(0) === "@"
                          ? biz.instagram.slice(1)
                          : biz.instagram
                      }`
                    );
                    if (biz.userID !== userId) {
                      logBusinessEvent(biz.$id || "", "instagram", userId);
                    }
                  }
                }}
                className="flex-row items-center"
              >
                <Ionicons name="logo-instagram" size={16} color="teal" />
                <Text style={{ marginLeft: 8, color: "teal" }}>
                  {biz.instagram}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Description */}
        <ExpandableDescription description={biz.description} />

        {/* Action Buttons */}
        {manage && (
          <View className="mt-5 flex-row justify-between">
            <Button
              mode="outlined"
              onPress={() => {
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    biz.location ?? ""
                  )}`
                );
              }}
              textColor="#14b8a6"
              style={{
                borderColor: "#14b8a6",
                flex: 1,
                marginRight: 8,
              }}
              icon="map"
            >
              Directions
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                if (biz.userID !== userId) {
                  logBusinessEvent(biz.$id || "", "call", userId);
                }
                Linking.openURL(`tel:${biz.phoneNumber}`);
              }}
              buttonColor="#14b8a6"
              style={{ flex: 1 }}
              icon="phone"
            >
              Call
            </Button>
          </View>
        )}

        {/* Reviews Section */}
        <ReviewsSection
          DATABASEID={DATABASEID}
          COLLECTIONID={BUSINESSREVIEWSCOLLECTIONID}
          data={biz}
          func={totalRating}
          refreshTrigger={refreshReviews}
          manage={manage}
        />
      </View>
    </Card>
  );
};

const ExpandableDescription = ({ description }: { description?: string }) => {
  const [showMore, setShowMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  return (
    <View>
      <Text
        className="text-gray-600 leading-5"
        numberOfLines={showMore ? undefined : 3}
        onTextLayout={(e) => {
          if (!showMore && e.nativeEvent.lines.length >= 3) {
            setIsTruncated(true);
          }
        }}
      >
        {description || "Business description goes here..."}
      </Text>
      {isTruncated && (
        <Button
          mode="text"
          compact
          style={{ alignSelf: "center" }}
          onPress={() => setShowMore(!showMore)}
          textColor="#14b8a6"
        >
          {showMore ? "Show Less" : "Show More"}
        </Button>
      )}
    </View>
  );
};

export default BusinessCards;
