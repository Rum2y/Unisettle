import { useEffect, useState, useCallback } from "react";
import {
  BOOKMARKSCOLLECTIONID,
  BUSINESSESCOLLECTIONID,
  DATABASEID,
  databases,
} from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import { useAuth } from "../context/auth-context";
import getImages from "./filePreview";
import Manage from "@/components/manage";

const SavedBusiness = () => {
  const [savedBusinesses, setSavedBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  // Then: Fetch the actual businesses once bookmarks are available
  const fetchSavedBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;
      const bookmarks = await databases.listDocuments(
        DATABASEID,
        BOOKMARKSCOLLECTIONID,
        [Query.equal("userID", user.$id)]
      );

      if (bookmarks.documents.length === 0) {
        setSavedBusinesses([]);
        return;
      }

      //Get all bookmarked businesses
      const businesses = await databases.listDocuments(
        DATABASEID,
        BUSINESSESCOLLECTIONID,
        [
          Query.equal(
            "$id",
            bookmarks.documents.map((b) => b.dataID)
          ),
        ]
      );

      // Fetch images for each business
      const businessesWithImages = await Promise.all(
        businesses.documents.map(async (business) => {
          const previewUrls = await getImages(business, true);
          return {
            ...business,
            images: previewUrls,
            bookmarkId: bookmarks.documents.find(
              (b) => b.dataID === business.$id
            )?.$id,
          };
        })
      );

      setSavedBusinesses(businessesWithImages);
    } catch (err) {
      console.error("Error fetching saved businesses:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedBusinesses();
  }, []);

  // Handle removing a bookmark from page
  const handleRemoveFromState = (bookmarkId: string) => {
    setSavedBusinesses((prev) =>
      prev.filter((b) => b.bookmarkId !== bookmarkId)
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSavedBusinesses();
    setRefreshing(false);
  };

  return (
    <Manage
      businesses={savedBusinesses}
      loading={loading}
      handleRemoveFromState={handleRemoveFromState}
      condition={true}
      edit={false}
      more={true}
      refresh={handleRefresh}
      refreshTrigger={refreshing}
    />
  );
};

export default SavedBusiness;
