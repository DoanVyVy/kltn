// hooks/useAudio.ts
import { useState, useEffect, useRef } from "react";

export const useAudio = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Tạo audio element mới mỗi khi URL thay đổi
  useEffect(() => {
    // Xóa audio element cũ nếu có
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }

    // Tạo element mới chỉ khi có URL
    if (currentUrl) {
      const audio = new Audio(currentUrl);

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      const handleError = (e: Event) => {
        console.error("Lỗi phát âm thanh:", e);
        setIsPlaying(false);
        setError(new Error("Không thể phát âm thanh"));
      };

      // Đăng ký sự kiện
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      // Lưu vào ref
      audioRef.current = audio;

      // Cleanup khi URL thay đổi hoặc component unmount
      return () => {
        audio.pause();
        audio.src = "";
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
      };
    }
  }, [currentUrl]);

  const play = (url?: string) => {
    // Nếu được truyền url mới, cập nhật currentUrl
    if (url && url !== currentUrl) {
      setCurrentUrl(url);

      // Nếu đang phát thì dừng lại
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
      }

      // Tạo mới audio với url mới
      const audio = new Audio(url);
      audioRef.current = audio;

      // Phát âm thanh
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("Lỗi khi phát âm thanh:", err);
            // Thử lại sau một chút
            setTimeout(() => {
              const newAudio = new Audio(url);
              audioRef.current = newAudio;
              newAudio.play().catch((e) => {
                console.error("Không thể phát âm thanh sau khi thử lại:", e);
              });
            }, 300);
          });
        }
      } catch (err) {
        console.error("Lỗi không xác định:", err);
      }

      return;
    }

    // Nếu không có url mới, tiếp tục với url hiện tại
    if (!currentUrl) return;

    // Nếu đang phát thì dừng lại
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      return;
    }

    // Tạo mới nếu chưa có
    if (!audioRef.current) {
      const audio = new Audio(currentUrl);
      audioRef.current = audio;
    }

    // Phát âm thanh
    try {
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("Lỗi khi phát âm thanh:", err);

          // Thử lại với audio element mới
          setTimeout(() => {
            // Tạo một audio element mới
            const newAudio = new Audio(currentUrl);

            // Ngắt kết nối audio cũ
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = "";
            }

            // Gán audio mới và phát
            audioRef.current = newAudio;
            newAudio.play().catch((e) => {
              console.error("Không thể phát âm thanh sau khi thử lại:", e);
            });
          }, 300);
        });
      }
    } catch (err) {
      console.error("Lỗi không xác định:", err);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    currentUrl,
    play,
    stop,
    error,
  };
};
