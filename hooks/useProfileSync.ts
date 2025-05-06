import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";

export function useProfileSync() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProfileExists = async () => {
      if (!user?.id) return;

      setIsChecking(true);
      setError(null);

      try {
        const response = await fetch(`/api/check-profile`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Lỗi khi kiểm tra hồ sơ");
        }

        const data = await response.json();
        setProfileExists(data.profileFound);
      } catch (err: any) {
        console.error("Lỗi khi kiểm tra hồ sơ:", err);
        setError(err.message);
        setProfileExists(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (user?.id) {
      checkProfileExists();
    }
  }, [user?.id]);

  return {
    isChecking,
    profileExists,
    error,
  };
}
