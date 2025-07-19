import { Alert } from "react-native";
import { useAuth } from "../context/auth-context";
import { useState, useEffect } from "react";
import {
  DATABASEID,
  BUSINESSESCOLLECTIONID,
  BUSINESSREVIEWSCOLLECTIONID,
  BOOKMARKSCOLLECTIONID,
} from "@/lib/appwrite";
import { databases } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import Manage from "@/components/manage";

const ManageBusiness = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserBusinesses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASEID,
        BUSINESSESCOLLECTIONID,
        [Query.equal("userID", user.$id)]
      );
      setBusinesses(response.documents);
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
      if (reviewsRes.documents.length === 0) return;
      for (const review of reviewsRes.documents) {
        await databases.deleteDocument(
          DATABASEID,
          BUSINESSREVIEWSCOLLECTIONID,
          review.$id
        );
      }

      // 2. Delete all related bookmarks
      const bookmarksRes = await databases.listDocuments(
        DATABASEID,
        BOOKMARKSCOLLECTIONID,
        [Query.equal("dataID", businessId)]
      );
      if (bookmarksRes.documents.length === 0) return;
      for (const bookmark of bookmarksRes.documents) {
        await databases.deleteDocument(
          DATABASEID,
          BOOKMARKSCOLLECTIONID,
          bookmark.$id
        );
      }

      // 3. Delete the business
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

  const deleteAllBusinesses = async () => {
    if (businesses.length === 0) return;

    Alert.alert(
      "Delete All Businesses",
      "Are you sure you want to delete ALL your businesses? This will also delete all related reviews and bookmarks. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          onPress: async () => {
            setIsDeleting(true);
            let deletionError = false;

            try {
              // Process each business sequentially
              for (const business of businesses) {
                try {
                  // 1. Delete all related reviews
                  try {
                    const reviewsRes = await databases.listDocuments(
                      DATABASEID,
                      BUSINESSREVIEWSCOLLECTIONID,
                      [Query.equal("storeid", business.$id)]
                    );
                    if (reviewsRes.documents) {
                      // Check if documents exists
                      for (const review of reviewsRes.documents) {
                        try {
                          await databases.deleteDocument(
                            DATABASEID,
                            BUSINESSREVIEWSCOLLECTIONID,
                            review.$id
                          );
                        } catch (reviewDeleteError) {
                          console.error(
                            `Failed to delete review ${review.$id}:`,
                            reviewDeleteError
                          );
                          deletionError = true;
                        }
                      }
                    }
                  } catch (reviewsQueryError) {
                    console.error(
                      `Failed to query reviews for business ${business.$id}:`,
                      reviewsQueryError
                    );
                    deletionError = true;
                  }

                  // 2. Delete all related bookmarks
                  try {
                    const bookmarksRes = await databases.listDocuments(
                      DATABASEID,
                      BOOKMARKSCOLLECTIONID,
                      [Query.equal("dataID", business.$id)]
                    );
                    if (bookmarksRes.documents) {
                      // Check if documents exists
                      for (const bookmark of bookmarksRes.documents) {
                        try {
                          await databases.deleteDocument(
                            DATABASEID,
                            BOOKMARKSCOLLECTIONID,
                            bookmark.$id
                          );
                        } catch (bookmarkDeleteError) {
                          console.error(
                            `Failed to delete bookmark ${bookmark.$id}:`,
                            bookmarkDeleteError
                          );
                          deletionError = true;
                        }
                      }
                    }
                  } catch (bookmarksQueryError) {
                    console.error(
                      `Failed to query bookmarks for business ${business.$id}:`,
                      bookmarksQueryError
                    );
                    deletionError = true;
                  }

                  // 3. Delete the business itself
                  try {
                    await databases.deleteDocument(
                      DATABASEID,
                      BUSINESSESCOLLECTIONID,
                      business.$id
                    );
                  } catch (businessDeleteError) {
                    console.error(
                      `Failed to delete business ${business.$id}:`,
                      businessDeleteError
                    );
                    deletionError = true;
                  }
                } catch (businessProcessError) {
                  console.error(
                    `Error processing business ${business.$id}:`,
                    businessProcessError
                  );
                  deletionError = true;
                }
              }

              // Refresh the list after all deletions
              await fetchUserBusinesses();

              if (deletionError) {
                Alert.alert(
                  "Partial Success",
                  "All businesses were processed, but some related data might not have been completely deleted."
                );
              }
            } catch (mainError) {
              console.error("Critical error during bulk deletion:", mainError);
              Alert.alert(
                "Error",
                "A critical error occurred during deletion. Some data might still exist."
              );
            } finally {
              setIsDeleting(false);
            }
          },
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
      loading={loading}
      isDeleting={isDeleting}
      deleteAllBusinesses={deleteAllBusinesses}
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
