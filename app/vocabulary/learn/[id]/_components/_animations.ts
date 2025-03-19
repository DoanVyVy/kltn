export const containerVariants = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.5,
			ease: "easeOut",
		},
	},
	exit: {
		opacity: 0,
		scale: 0.8,
		transition: {
			duration: 0.3,
		},
	},
};

export const buttonVariants = {
	idle: { scale: 1 },
	hover: { scale: 1.05 },
	tap: { scale: 0.95 },
	correct: {
		backgroundColor: "rgb(34, 197, 94)",
		color: "white",
		scale: [1, 1.1, 1],
		transition: { duration: 0.3 },
	},
	incorrect: {
		backgroundColor: "rgb(239, 68, 68)",
		color: "white",
		scale: [1, 0.9, 1],
		transition: { duration: 0.3 },
	},
};

export const floatAnimation = {
	y: [0, -10, 0],
	transition: {
		duration: 2,
		repeat: Number.POSITIVE_INFINITY,
		ease: "easeInOut",
	},
};
