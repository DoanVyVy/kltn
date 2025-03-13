"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VocabularyCategory } from "@prisma/client";

interface NavigationHeaderProps {
	collection: VocabularyCategory | undefined;
	onBack: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
	collection,
	onBack,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			className="mb-6 flex items-center justify-between"
		>
			<Button
				variant="ghost"
				className="gap-2 text-game-accent hover:bg-game-primary/10 rounded-full"
				onClick={onBack}
			>
				<ArrowLeft className="h-4 w-4" />
				Quay lại
			</Button>

			<div className="text-right">
				<h2 className="text-lg font-bold text-game-accent">
					{collection?.categoryName}
				</h2>
				<p className="text-sm text-game-accent/70">
					{collection?.totalWords} từ vựng
				</p>
			</div>
		</motion.div>
	);
};
