import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { DATABASEID, BOOKMARKSCOLLECTIONID, databases } from "@/lib/appwrite";
import { ID, Query } from "react-native-appwrite";
import { useAuth } from "@/app/context/auth-context";
import AuthModal from "./modal";

const Bookmark = ({
  data,
  deleteBookmark,
  refreshTrigger,
}: {
  data: any;
  deleteBookmark?: (id: string) => void;
  refreshTrigger?: boolean;
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    // Check if the user is logged in and has a valid data ID
    if (!user || !data?.$id) return;

    //Fetch the bookmark status for the current user and data ID
    const checkBookmark = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASEID,
          BOOKMARKSCOLLECTIONID,
          [Query.equal("userID", user.$id), Query.equal("dataID", data.$id)]
        );

        setIsBookmarked(response.documents.length > 0);
        if (response.documents.length > 0) {
          setBookmarkId(response.documents[0].$id);
        } else {
          setBookmarkId(null);
        }
      } catch (error) {
        console.error("Failed to check bookmark:", error);
      }
    };

    checkBookmark();
  }, [data.$id, user, refreshTrigger === true]);

  // Function to toggle bookmark status
  const setBookmark = async () => {
    if (loading || !data?.$id || !user) {
      setShowAuthModal(true);
      return;
    }
    setLoading(true);
    try {
      if (!isBookmarked) {
        const response = await databases.createDocument(
          DATABASEID,
          BOOKMARKSCOLLECTIONID,
          ID.unique(),
          {
            userID: user.$id,
            dataID: data.$id,
          }
        );
        if (response) {
          setIsBookmarked(true);
          setBookmarkId(response.$id);
        }
      } else {
        await databases.deleteDocument(
          DATABASEID,
          BOOKMARKSCOLLECTIONID,
          bookmarkId!
        );
        deleteBookmark?.(bookmarkId!);
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } catch (error) {
      console.error("Failed to set bookmark:", error);
      setIsBookmarked(false);
    } finally {
      setLoading(false);
    }
  };

  // Render the bookmark icon
  return (
    <>
      <TouchableOpacity onPress={setBookmark} disabled={loading}>
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={30}
          color={loading ? "#a0a0a0" : "#005965"}
        />
      </TouchableOpacity>
      {showAuthModal && (
        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          description="Please sign in to bookmark this business."
        />
      )}
    </>
  );
};

export default Bookmark;
