import { useState, useEffect, useRef } from "react";
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add debugging logs
  useEffect(() => {
    if (user) {
      console.log("Current user info:", {
        id: user.id,
        email: user.email,
      });
    } else {
      console.log("No user found in auth context");
      setIsLoading(false);
    }
  }, [user]);

  // Set a safety timeout to prevent infinite loading
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If we're loading, set a safety timeout
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        console.log("Safety timeout triggered - forcing loading to end");
        setIsLoading(false);
      }, 10000); // 10 second safety timeout (increased from 5s)
    }

    // Cleanup timeout when component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);

  // Use email lookup directly, skip ID lookup entirely
  const getUserByEmailQuery = trpc.user.getUserProfileByEmail.useQuery(
    { email: user?.email || "" },
    {
      enabled: !!user?.email,
      retry: 2,
      retryDelay: 1000,
      staleTime: 1000 * 60 * 5, // 5 minutes
      onError: (error) => {
        console.error("Profile query error (by email):", error);
        setError(error.message);
        setIsLoading(false);
      },
      onSuccess: (data) => {
        console.log("Profile data received by email:", data);

        // Handle null data case
        if (!data) {
          console.warn("No profile found by user email:", user?.email);
          setError("Không tìm thấy thông tin hồ sơ người dùng");
          setIsLoading(false);
          return;
        }

        // Format and set profile data
        try {
          const formattedData = formatProfileData(data);
          setProfileData(formattedData);
          setError(null);
          setIsLoading(false);
        } catch (err) {
          console.error("Error formatting profile data:", err);
          setError("Lỗi định dạng dữ liệu hồ sơ");
          setIsLoading(false);
        }
      },
    }
  );

  // Explicitly sync loading state with query state
  useEffect(() => {
    // Print the current state of the query for debugging
    console.log("Query state:", {
      isLoading: getUserByEmailQuery.isLoading,
      isSuccess: getUserByEmailQuery.isSuccess,
      isError: getUserByEmailQuery.isError,
      isFetching: getUserByEmailQuery.isFetching,
      status: getUserByEmailQuery.status,
      data: getUserByEmailQuery.data ? "Has data" : "No data",
    });

    // Always set loading to true when fetching starts
    if (getUserByEmailQuery.isLoading || getUserByEmailQuery.isFetching) {
      setIsLoading(true);
    }

    if (!user?.email) {
      // If no user email, we're not loading
      setIsLoading(false);
    } else if (getUserByEmailQuery.status === "success") {
      // If query succeeded, we need to make sure data is properly set before ending loading
      if (getUserByEmailQuery.data) {
        try {
          const formattedData = formatProfileData(getUserByEmailQuery.data);
          setProfileData(formattedData);
          setError(null);
          // Only end loading when we've successfully processed the data
          setIsLoading(false);
        } catch (err) {
          console.error("Error formatting profile data in effect:", err);
          setError("Lỗi định dạng dữ liệu hồ sơ");
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } else if (getUserByEmailQuery.status === "error") {
      // If query failed, we're done loading
      setIsLoading(false);
    }
  }, [
    user?.email,
    getUserByEmailQuery.status,
    getUserByEmailQuery.data,
    getUserByEmailQuery.isLoading,
    getUserByEmailQuery.isFetching,
  ]);

  // Format the profile data
  const formatProfileData = (data: any): UserProfileData => {
    return {
      ...data,
      lastActiveDate: data.lastActiveDate
        ? new Date(data.lastActiveDate)
        : null,
      createdAt: new Date(data.createdAt),
      achievements: (data.achievements || []).map((achievement: any) => ({
        ...achievement,
        dateAchieved: achievement.dateAchieved
          ? new Date(achievement.dateAchieved)
          : new Date(),
      })),
    };
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log("Profile loading state:", isLoading);
    console.log("Profile error state:", error);
    console.log("Profile data state:", profileData ? "Has data" : "No data");
  }, [isLoading, error, profileData]);

  return {
    profile: profileData,
    isLoading,
    error,
    refetch: getUserByEmailQuery.refetch,
  };
}
