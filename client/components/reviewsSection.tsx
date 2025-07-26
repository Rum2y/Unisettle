import { View, TextInput, Alert, TouchableOpacity } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useState, useEffect, use } from "react";
import StarRating, { StarRatingDisplay } from "react-native-star-rating-widget";
import { databases } from "@/lib/appwrite";
import { Query, ID } from "react-native-appwrite";
import AuthModal from "./modal";
import { useAuth } from "@/app/context/auth-context";

interface ReviewsSectionProps {
  DATABASEID: string;
  COLLECTIONID: string;
  data: any;
  func: (rating: number, id: string) => void;
  refreshTrigger?: boolean;
  manage?: boolean;
}

const ReviewsSection = ({
  DATABASEID,
  COLLECTIONID,
  data,
  func,
  refreshTrigger,
  manage,
}: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<string>("");
  const [showReviews, setShowReviews] = useState<any[]>([]);
  const [isReviewsVisible, setIsReviewsVisible] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const { user } = useAuth();
  const theme = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fetchReviews = async () => {
    try {
      const response = await databases.listDocuments(DATABASEID, COLLECTIONID, [
        Query.equal("storeid", data.$id),
      ]);
      setShowReviews(response.documents);
      const averageRating =
        response.documents.reduce((acc, review) => acc + review.rating, 0) /
          response.documents.length || 0;
      func && func(averageRating, data.$id);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [data.$id, refreshTrigger === true]);

  const sendReviews = async () => {
    if (reviews.trim() === "") setError("Review cannot be empty.");
    else if (!user) {
      setShowAuthModal(true);
      setError("Please sign in to leave a review.");
      return;
    } else if (rating < 1)
      setError("Please select a rating before submitting.");
    else {
      try {
        const newReview = {
          storeid: data.$id,
          author: user?.name,
          text: reviews,
          timestamp: new Date().toISOString(),
          rating: rating,
          userId: user?.$id,
        };

        const createdReview = await databases.createDocument(
          DATABASEID,
          COLLECTIONID,
          ID.unique(),
          newReview
        );
        setReviews("");
        setRating(0);
        setShowReviews((prev) => [...prev, createdReview]);
        setError(null);
      } catch (error) {
        console.error("Error sending review:", error);
      }
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (
      user?.$id !==
      showReviews.find((review) => review.$id === reviewId)?.userId
    )
      return;
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteReview(reviewId),
        },
      ]
    );
  };

  const confirmDeleteReview = async (reviewId: string) => {
    try {
      await databases.deleteDocument(
        DATABASEID,
        COLLECTIONID,
        showReviews.find((review) => review.$id === reviewId)?.$id || ""
      );
      setShowReviews(showReviews.filter((review) => review.$id !== reviewId));
      // Recalculate average rating after deletion
      const updatedReviews = showReviews.filter(
        (review) => review.$id !== reviewId
      );
      const averageRating =
        updatedReviews.reduce((acc, review) => acc + review.rating, 0) /
          updatedReviews.length || 0;
      func && func(averageRating, data.$id);
    } catch (error) {
      console.error("Error deleting review:", error);
      Alert.alert("Error", "Failed to delete the review. Please try again.");
    }
  };

  return (
    <View>
      {/* Reviews Toggle Button */}
      <Button
        mode="text"
        onPress={() => setIsReviewsVisible(!isReviewsVisible)}
        textColor="teal"
        compact
        style={{ marginTop: 12, alignSelf: "center" }}
      >
        {isReviewsVisible
          ? "Hide Reviews"
          : `Show Reviews (${showReviews.length})`}
      </Button>

      {/* Reviews Section */}
      {isReviewsVisible && (
        <View className="mt-4">
          {/* Reviews List */}
          {showReviews.length > 0 ? (
            <View className="mb-4 space-y-3">
              {showReviews.map((review, index) => (
                <TouchableOpacity
                  key={review.$id || index}
                  className="bg-gray-50 p-3 rounded-lg"
                  onLongPress={() => handleDeleteReview(review.$id)}
                  activeOpacity={0.8}
                >
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-sm font-semibold text-teal-700">
                      {review.author}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatDate(review.timestamp)}
                    </Text>
                  </View>
                  <StarRatingDisplay
                    rating={review.rating}
                    color="#14b8a6"
                    starSize={16}
                    starStyle={{ marginHorizontal: 1 }}
                    style={{ marginBottom: 4 }}
                  />
                  <Text className="text-sm text-gray-700">{review.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-500 italic mb-4">
              No reviews yet. Be the first to review!
            </Text>
          )}

          {/* Review Input */}
          {manage && (
            <View>
              <StarRating
                rating={rating}
                onChange={setRating}
                color="#14b8a6"
                starSize={24}
                style={{ marginBottom: 10 }}
              />
              <TextInput
                placeholder="Leave a review..."
                value={reviews}
                onChangeText={setReviews}
                placeholderTextColor={"#9ca3af"}
                multiline
                className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />
              {error && (
                <Text
                  className="text-xs"
                  style={{ color: theme.colors.error, marginBottom: 10 }}
                >
                  {error}
                </Text>
              )}

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={sendReviews}
                buttonColor="teal"
                style={{ marginTop: 10 }}
                disabled={!reviews.trim()}
              >
                Submit Review
              </Button>
            </View>
          )}
        </View>
      )}
      {/* Auth Modal */}
      <AuthModal
        description="Please sign in to leave a review."
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </View>
  );
};

export default ReviewsSection;
