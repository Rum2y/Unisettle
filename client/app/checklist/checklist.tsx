import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Gradient from "@/components/gradient";
import { shadowStyle } from "../guides/bankAccount";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { CHECKLISTCOLLECTIONID, DATABASEID, databases } from "@/lib/appwrite";
import { ID, Query } from "react-native-appwrite";
import Filters from "@/components/filter";
import { tasks } from "@/tasks";

interface Task {
  title: string;
  description: string;
  recommended: string;
  router?: string;
  completed: boolean;
}

type FilterType = "all" | "completed" | "incomplete";

const Checklist = () => {
  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterType>("all");
  const [showCompleted, setShowCompleted] = useState(
    tasks.map((task) => {
      return { ...task, completed: false };
    })
  );

  const filteredResults = (tasks: Task[], filter: FilterType): Task[] => {
    if (filter === "all") return tasks;
    if (filter === "completed") return tasks.filter((task) => task.completed);
    if (filter === "incomplete") return tasks.filter((task) => !task.completed);
    return tasks;
  };

  const toggleCompletion = (title: string) => {
    setShowCompleted((prev) => {
      const updated = [...prev];
      const task = updated.find((task) => task.title === title);
      if (task) {
        task.completed = !task.completed;
      }
      return updated;
    });
  };

  useEffect(() => {
    const sendCheckList = async () => {
      if (!user) return;

      const checklistPayload: Record<string, boolean | string> = {
        userID: user.$id,
      };

      showCompleted.forEach((task) => {
        let key = task.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z\-]/g, "");
        checklistPayload[key] = task.completed;
      });

      try {
        // Step 1: Check if document exists for this user
        const response = await databases.listDocuments(
          DATABASEID,
          CHECKLISTCOLLECTIONID,
          [Query.equal("userID", user.$id)]
        );

        if (response.documents.length > 0) {
          // Step 2: Document exists → Update it
          const docID = response.documents[0].$id;
          await databases.updateDocument(
            DATABASEID,
            CHECKLISTCOLLECTIONID,
            docID,
            checklistPayload
          );
        } else {
          // Step 3: Document doesn't exist → Create it
          await databases.createDocument(
            DATABASEID,
            CHECKLISTCOLLECTIONID,
            ID.unique(),
            checklistPayload
          );
        }
      } catch (error) {
        console.error("Failed to save checklist:", error);
      }
    };

    sendCheckList();
  }, [showCompleted]);

  useEffect(() => {
    fetchCheckList();
  }, [user]);

  const fetchCheckList = async () => {
    if (!user) return;

    try {
      const response = await databases.listDocuments(
        DATABASEID,
        CHECKLISTCOLLECTIONID,
        [Query.equal("userID", user.$id)]
      );

      if (response.documents.length > 0) {
        const data = response.documents[0]; // use the first document

        const updatedChecklist = tasks.map((task) => {
          let key = task.title.toLowerCase().replace(/\s+/g, "-"); // e.g., "Apply for SIN" → "apply-for-sin"
          key = key.replace(/[^a-z\-]/g, ""); // clean any special chars (like commas)
          return {
            ...task,
            completed: Boolean(data[key]), // assign boolean value from database
          };
        });

        setShowCompleted(updatedChecklist);
      }
    } catch (err) {
      console.error("Error fetching checklist:", err);
    }
  };

  const completedCount = showCompleted.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <Gradient
      styleContainer={{
        paddingHorizontal: 16,
        paddingVertical: 24,
      }}
    >
      {/* Header */}
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Ionicons name="document-text-outline" size={24} color="#005965" />
          <Text className="ml-2 text-3xl font-bold text-[#005965]">
            Settlement Checklist
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-600">
            {completedCount} of {totalCount} completed
          </Text>
          <Text className="text-teal-600 font-medium">
            {Math.round(progressPercent)}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-3 bg-gray-100 rounded-full mb-8">
        <View
          className="h-3 bg-teal-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      {/*Filters */}
      <View className="flex-row items-center mb-4 justify-between">
        <Filters
          icon="filter-outline"
          label="All"
          func={() => setFilter("all")}
          selected={filter === "all"}
        />
        <Filters
          icon="checkmark-outline"
          label="Completed"
          func={() => setFilter("completed")}
          selected={filter === "completed"}
        />
        <Filters
          icon="close-outline"
          label="Incomplete"
          func={() => setFilter("incomplete")}
          selected={filter === "incomplete"}
        />
      </View>

      {/* Task Cards */}
      <View className="pb-20">
        {filteredResults(showCompleted, filter).map((task, index) => (
          <View
            key={index}
            className={`p-5 mb-4 rounded-xl border-l-4 ${
              task.completed
                ? "border-l-teal-500 bg-gray-100"
                : "border-l-gray-200 bg-white"
            }`}
            style={shadowStyle(0.1).shadow}
          >
            {/* Title and Status */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons
                  onPress={() => {
                    toggleCompletion(task.title);
                  }}
                  name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={task.completed ? "#10b981" : "#9ca3af"}
                />
                <Text
                  className={`ml-3 font-semibold text-base ${
                    task.completed
                      ? "text-gray-500 line-through"
                      : "text-gray-800"
                  }`}
                >
                  {task.title}
                </Text>
              </View>
            </View>

            {/* Timeline */}
            <View className="flex-row items-center mb-1">
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text className="ml-1 text-xs text-gray-500">
                {task.recommended}
              </Text>
            </View>

            {/* Description */}
            <Text
              className={`text-sm mb-3 ${
                task.completed ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {task.description}
            </Text>

            {/* Action Button */}
            <TouchableOpacity
              disabled={task.completed}
              className="bg-teal-500 rounded-lg px-4 py-2 flex-row items-center justify-between"
              activeOpacity={0.8}
              onPress={() => router.push((task.router || "/guides") as any)}
            >
              <Text className="text-sm font-medium text-white">
                View Instructions
              </Text>
              <Ionicons name="chevron-forward" size={14} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Gradient>
  );
};

export default Checklist;
