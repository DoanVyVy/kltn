"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningStats } from "../_types";
import { floatAnimation } from "./_animations";

interface CelebrationScreenProps {
	stats: LearningStats;
	onFinish: () => void;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
	stats,
	onFinish,
}) => {
	return (
		<motion.div
			className="flex flex-col items-center justify-center space-y-6 rounded-3xl bg-white p-8 text-center shadow-lg"
			initial={{ opacity: 0, scale: 0.5 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.5 }}
		>
			<motion.div animate={floatAnimation} className="flex gap-2">
				<motion.div
					animate={{ rotate: [0, 10, -10, 0] }}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
					}}
					className="text-6xl"
				>
					🎉
				</motion.div>
				<motion.div
					animate={{ rotate: [0, -10, 10, 0] }}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						delay: 0.3,
					}}
					className="text-6xl"
				>
					🎊
				</motion.div>
			</motion.div>
			<h2 className="text-3xl font-bold text-game-accent">Chúc mừng!</h2>
			<p className="text-game-accent/70">Bạn đã hoàn thành bài học</p>

			<div className="grid grid-cols-2 gap-4 w-full max-w-xs">
				<div className="rounded-2xl bg-green-50 p-4 text-center border-2 border-green-100">
					<div className="text-2xl font-bold text-green-600">
						{stats.correct}
					</div>
					<div className="text-sm text-green-600">Đúng</div>
				</div>
				<div className="rounded-2xl bg-red-50 p-4 text-center border-2 border-red-100">
					<div className="text-2xl font-bold text-red-600">
						{stats.incorrect}
					</div>
					<div className="text-sm text-red-600">Sai</div>
				</div>
			</div>

			<motion.div
				className="mt-4 w-full"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
			>
				<Button
					className="game-button w-full rounded-full text-lg py-6"
					onClick={onFinish}
				>
					Hoàn thành
					<Star className="ml-2 h-5 w-5" />
				</Button>
			</motion.div>

			<motion.p
				className="text-game-accent/50 text-sm"
				initial={{ opacity: 0 }}
				animate={{ opacity: [0, 1, 0] }}
				transition={{
					duration: 2,
					repeat: Number.POSITIVE_INFINITY,
				}}
			>
				Đang chuyển hướng...
			</motion.p>
		</motion.div>
	);
};
