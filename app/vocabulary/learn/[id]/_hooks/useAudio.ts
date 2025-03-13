// hooks/useAudio.ts
import React, { useRef, useState, useEffect } from "react";

export const useAudio = (audioUrl: string | undefined) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	useEffect(() => {
		if (!audioRef.current) {
			audioRef.current = new Audio(audioUrl || "");
		} else {
			audioRef.current.src = audioUrl || "";
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
			}
		};
	}, [audioUrl]);
	React.useEffect(() => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.play();
		} else {
			audioRef.current.pause();
		}
	}, [isPlaying, audioUrl]);

	const play = () => {
		setIsPlaying(true);
	};

	const pause = () => {
		setIsPlaying(false);
	};

	return { isPlaying, play, pause };
};
