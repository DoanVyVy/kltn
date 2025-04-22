import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { useAuth } from "./use-auth";

export type UserProfileData = {
  userId: string;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  currentLevel: number;
  totalPoints: number;
  streakDays: number;
  lastActiveDate: Date | null;
  createdAt: Date;
  role: string;
  wordsLearned: number;
  grammarRulesLearned: number;
  gamesCompleted: number;
  achievements: {
    id: number;
    title: string;
    description: string;
    icon: string;
    category: string;
    dateAchieved: Date;
    completed: boolean;
  }[];
  wordCategories: {
    categoryId: number;
    name: string;
    count: number;
  }[];
  grammarCategories: {
    categoryId: number;
    name: string;
    count: number;
  }[];
};

export function useUserProfile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  // Add debugging logs
  useEffect(() => {
    if (user) {
      console.log("Current user info:", {
        id: user.id,
        email: user.email,
      });
    } else {
      console.log("No user found in auth context");
    }
  }, [user]);

  const getUserQuery = trpc.user.getUserProfile.useQuery(
    { userId: user?.id || "" },
    {
      enabled: !!user?.id,
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
      onError: (error) => {
        console.error("Profile query error:", error);
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        setError(error.message);
        setIsLoading(false);
      },
      onSuccess: (data) => {
        console.log("Profile data received:", data);
        console.log("Profile data type:", typeof data);
        console.log("Query params used:", { userId: user?.id || "" });
        
        // Handle null data case
        if (!data) {
          console.warn("No profile data found for user ID:", user?.id);
          setError("Không tìm thấy thông tin hồ sơ người dùng");
          setIsLoading(false);
          return;
        }
      },
      onSettled: () => {
        console.log("Query settled with state:", {
          isLoading: getUserQuery.isLoading,
          isSuccess: getUserQuery.isSuccess,
          isError: getUserQuery.isError,
          isFetched: getUserQuery.isFetched,
          status: getUserQuery.status,
          fetchStatus: getUserQuery.fetchStatus
        });
        setIsLoading(false);
      },
    }
  );

  // Log state changes
  useEffect(() => {
    console.log("Profile loading state:", isLoading);
    console.log("Profile error state:", error);
    console.log("Profile data state:", profileData ? "Has data" : "No data");
  }, [isLoading, error, profileData]);

  useEffect(() => {
    if (getUserQuery.isSuccess) {
      if (!getUserQuery.data) {
        setError("Không tìm thấy thông tin hồ sơ người dùng");
        setIsLoading(false);
        return;
      }
      
      try {
        const formattedData = {
          ...getUserQuery.data,
          lastActiveDate: getUserQuery.data.lastActiveDate
            ? new Date(getUserQuery.data.lastActiveDate)
            : null,
          createdAt: new Date(getUserQuery.data.createdAt),
          achievements: getUserQuery.data.achievements.map((achievement) => ({
            ...achievement,
            dateAchieved: achievement.dateAchieved
              ? new Date(achievement.dateAchieved)
              : new Date(),
          })),
        };

        setProfileData(formattedData as UserProfileData);
        setError(null);
      } catch (err) {
        console.error("Error formatting profile data:", err);
        setError("Lỗi định dạng dữ liệu hồ sơ");
      } finally {
        setIsLoading(false);
      }
    }
  }, [getUserQuery.data, getUserQuery.isSuccess]);

  return {
    profile: profileData,
    isLoading: isLoading && getUserQuery.isLoading,  // Changed from OR to AND
    error,
    refetch: getUserQuery.refetch,
  };
}
