"use client";

import React from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

interface AudioButtonProps {
	isPlaying: boolean;
	onClick: () => void;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
	isPlaying,
	onClick,
}) => {
	return (
		<motion.button
			animate={
				isPlaying
					? {
							scale: [1, 1.2, 1],
							boxShadow: [
								"0 0 0 rgba(215, 108, 130, 0)",
								"0 0 20px rgba(215, 108, 130, 0.7)",
								"0 0 0 rgba(215, 108, 130, 0)",
							],
					  }
					: {}
			}
			className="h-32 w-32 rounded-full bg-gradient-to-r from-game-primary to-game-secondary text-white transition-all"
			onClick={onClick}
			transition={{ duration: 0.5 }}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
		>
			<Volume2 className="h-16 w-16 mx-auto" />
		</motion.button>
	);
};
