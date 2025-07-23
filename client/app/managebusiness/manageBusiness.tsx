import { Alert } from "react-native";
import { useAuth } from "../context/auth-context";
import { useState, useEffect } from "react";
import {
  DATABASEID,
  BUSINESSESCOLLECTIONID,
  BUSINESSREVIEWSCOLLECTIONID,
  BOOKMARKSCOLLECTIONID,
  BUSINESS_LOGGED_EVENTS_COLLECTION_ID,
} from "@/lib/appwrite";
import { databases } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import Manage from "@/components/manage";

const ManageBusiness = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessStats, setBusinessStats] = useState<
    Record<string, { calls: number; instagram: number; views: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserBusinesses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch businesses owned by the user
      const response = await databases.listDocuments(
        DATABASEID,
        BUSINESSESCOLLECTIONID,
        [Query.equal("userID", user.$id)]
      );
      setBusinesses(response.documents);

      // Fetch business stats
      const statsMap: Record<
        string,
        { calls: number; instagram: number; views: number }
      > = {};

      const today = new Date().toISOString().slice(0, 7);
      for (const biz of response.documents) {
        const eventsRes = await databases.listDocuments(
          DATABASEID,
          BUSINESS_LOGGED_EVENTS_COLLECTION_ID,
          [Query.equal("businessId", biz.$id), Query.equal("month", today)]
        );

        const events = eventsRes.documents;
        statsMap[biz.$id] = {
          calls: events.filter((e) => e.type === "call").length,
          instagram: events.filter((e) => e.type === "instagram").length,
          views: events.filter((e) => e.type === "view").length,
        };
      }

      setBusinessStats(statsMap);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBusiness = async (businessId: string) => {
    try {
      // 1. Delete all related reviews
      const reviewsRes = await databases.listDocuments(
        DATABASEID,
        BUSINESSREVIEWSCOLLECTIONID,
        [Query.equal("storeid", businessId)]
      );

      if (reviewsRes.documents.length > 0) {
        for (const review of reviewsRes.documents) {
          await databases.deleteDocument(
            DATABASEID,
            BUSINESSREVIEWSCOLLECTIONID,
            review.$id
          );
        }
      }

      // 2. Delete all related bookmarks
      const bookmarksRes = await databases.listDocuments(
        DATABASEID,
        BOOKMARKSCOLLECTIONID,
        [Query.equal("dataID", businessId)]
      );

      if (bookmarksRes.documents.length > 0) {
        for (const bookmark of bookmarksRes.documents) {
          await databases.deleteDocument(
            DATABASEID,
            BOOKMARKSCOLLECTIONID,
            bookmark.$id
          );
        }
      }

      // 3. Delete all logged events for this business
      const businessStats = await databases.listDocuments(
        DATABASEID,
        BUSINESS_LOGGED_EVENTS_COLLECTION_ID,
        [Query.equal("businessId", businessId)]
      );

      if (businessStats.documents.length > 0) {
        for (const event of businessStats.documents) {
          await databases.deleteDocument(
            DATABASEID,
            BUSINESS_LOGGED_EVENTS_COLLECTION_ID,
            event.$id
          );
        }
      }

      // 4. Delete the business
      await databases.deleteDocument(
        DATABASEID,
        BUSINESSESCOLLECTIONID,
        businessId
      );

      // 4. Refresh
      fetchUserBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error);
      Alert.alert("Error", "Failed to delete business and related data");
    }
  };

  const confirmDelete = (businessId: string) => {
    Alert.alert(
      "Delete Business",
      "Are you sure you want to delete this business?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteBusiness(businessId),
          style: "destructive",
        },
      ]
    );
  };

  useEffect(() => {
    fetchUserBusinesses();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserBusinesses();
    setRefreshing(false);
  };
  return (
    <Manage
      businesses={businesses}
      businessStats={businessStats}
      loading={loading}
      confirmDelete={confirmDelete}
      edit={true}
      more={false}
      condition={false}
      refreshTrigger={refreshing}
      refresh={handleRefresh}
    />
  );
};

export default ManageBusiness;
