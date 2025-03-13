"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, Clock, Plus, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import { VocabularyModeDialog } from "@/components/vocabulary-mode-dialog";
import dayjs from "dayjs";
import { trpc } from "@/trpc/client";
// Dữ liệu mẫu cho các khóa học từ vựng
const vocabularyCourses = [
	{
		id: 1,
		title: "500 Từ vựng TOEIC cơ bản",
		description: "Những từ vựng thiết yếu cho kỳ thi TOEIC",
		category: "Tiếng Anh thương mại",
		level: "Sơ cấp",
		totalWords: 500,
		learnedWords: 125,
		creator: "Admin",
		isFeatured: true,
		isBookmarked: true,
		tags: ["TOEIC", "Business"],
	},
	{
		id: 2,
		title: "Từ vựng giao tiếp hàng ngày",
		description: "Từ vựng thông dụng trong cuộc sống hàng ngày",
		category: "Tiếng Anh giao tiếp",
		level: "Sơ cấp",
		totalWords: 300,
		learnedWords: 210,
		creator: "Admin",
		isFeatured: true,
		isBookmarked: false,
		tags: ["Daily", "Conversation"],
	},
	{
		id: 3,
		title: "Từ vựng học thuật",
		description: "Từ vựng cần thiết cho học tập và nghiên cứu",
		category: "Tiếng Anh học thuật",
		level: "Trung cấp",
		totalWords: 400,
		learnedWords: 50,
		creator: "Admin",
		isFeatured: false,
		isBookmarked: true,
		tags: ["Academic", "Study"],
	},
	{
		id: 4,
		title: "Từ vựng công nghệ thông tin",
		description: "Từ vựng chuyên ngành IT và công nghệ",
		category: "Tiếng Anh chuyên ngành",
		level: "Trung cấp",
		totalWords: 350,
		learnedWords: 0,
		creator: "Admin",
		isFeatured: false,
		isBookmarked: false,
		tags: ["IT", "Technology"],
	},
	{
		id: 5,
		title: "Thành ngữ và cụm từ thông dụng",
		description: "Các thành ngữ và cụm từ phổ biến trong tiếng Anh",
		category: "Tiếng Anh giao tiếp",
		level: "Nâng cao",
		totalWords: 200,
		learnedWords: 35,
		creator: "Admin",
		isFeatured: true,
		isBookmarked: false,
		tags: ["Idioms", "Phrases"],
	},
	{
		id: 6,
		title: "Từ vựng du lịch",
		description: "Từ vựng cần thiết khi đi du lịch nước ngoài",
		category: "Tiếng Anh giao tiếp",
		level: "Sơ cấp",
		totalWords: 250,
		learnedWords: 180,
		creator: "Admin",
		isFeatured: false,
		isBookmarked: true,
		tags: ["Travel", "Vacation"],
	},
];

// Dữ liệu mẫu cho các bộ từ vựng đang học

export default function VocabularyPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("learning");
	const [showModeDialog, setShowModeDialog] = useState(false);
	const [selectedCourseId, setSelectedCourseId] = useState<number>(0);

	// Lọc khóa học dựa trên từ khóa tìm kiếm
	const filteredCourses = vocabularyCourses.filter(
		(course) =>
			course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			course.description
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
			course.tags.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase())
			)
	);
	const { data = [], isLoading } =
		trpc.userProcess.getCategoryProcesses.useQuery();
	// toDo: loading animation

	const { data: allCourses = [] } =
		trpc.vocabularyCategory.getValidCategories.useQuery();

	const { mutateAsync } = trpc.userProcess.userRegisterCategory.useMutation();
	const utils = trpc.useUtils();
	const handleRegister = async () => {
		await mutateAsync({
			categoryId: selectedCourseId,
		});
		utils.userProcess.getCategoryProcesses.invalidate();
	};

	return (
		<div className="min-h-screen bg-game-background">
			<Navigation />

			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-game-accent">
						Học Từ Vựng
					</h1>
					<p className="text-game-accent/80">
						Mở rộng vốn từ vựng tiếng Anh của bạn thông qua các
						phương pháp học hiệu quả
					</p>
				</div>

				<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="relative w-full md:max-w-md">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
						<Input
							placeholder="Tìm kiếm khóa học từ vựng..."
							className="pl-10"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" className="gap-2">
							<Filter className="h-4 w-4" />
							Lọc
						</Button>
						<Button className="game-button gap-2">
							<Plus className="h-4 w-4" />
							Tạo bộ từ vựng mới
						</Button>
					</div>
				</div>

				<Tabs
					defaultValue="learning"
					onValueChange={setActiveTab}
					className="w-full"
				>
					<TabsList className="mb-6 grid w-full grid-cols-3 bg-game-background">
						<TabsTrigger
							value="learning"
							className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
						>
							Đang học
						</TabsTrigger>
						<TabsTrigger
							value="explore"
							className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
						>
							Khám phá
						</TabsTrigger>
						<TabsTrigger
							value="bookmarked"
							className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
						>
							Đã lưu
						</TabsTrigger>
					</TabsList>

					{/* Tab Đang học */}
					<TabsContent value="learning" className="space-y-6">
						{data.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{data.map((course) => (
									<motion.div
										key={course.categoryId}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3 }}
										whileHover={{ y: -5 }}
									>
										<Card className="game-card h-full transition-all hover:border-game-primary/50">
											<CardHeader className="pb-2">
												<CardTitle className="text-xl text-game-accent">
													{
														course.category
															?.categoryName
													}
												</CardTitle>
												<CardDescription className="flex items-center gap-1 text-game-accent/70">
													<Clock className="h-4 w-4" />{" "}
													{dayjs().format(
														"DD/MM/YYYY"
													)}
												</CardDescription>
											</CardHeader>
											<CardContent className="pb-2">
												<div className="mb-4 space-y-2">
													<div className="flex justify-between text-sm">
														<span className="text-game-accent">
															Tiến độ
														</span>
														<span className="text-game-primary">
															{course.processPercentage.toFixed(
																0
															)}
															%
														</span>
													</div>
													<Progress
														value={parseInt(
															course.processPercentage.toFixed(
																0
															)
														)}
														className="h-2 bg-white"
														indicatorClassName="bg-game-primary"
													/>
												</div>
												<div className="flex flex-wrap gap-2">
													<Badge
														variant="outline"
														className="bg-game-primary/10 text-game-primary"
													>
														8 từ cần ôn tập
													</Badge>
													{/* {course.streak > 0 && (
														<Badge
															variant="outline"
															className="bg-amber-100 text-amber-700"
														>
															<TrendingUp className="mr-1 h-3 w-3" />{" "}
															{course.streak} ngày
															liên tục
														</Badge>
													)} */}
												</div>
											</CardContent>
											<CardFooter>
												<Button
													className="game-button w-full"
													onClick={() => {
														setSelectedCourseId(
															course.category
																?.categoryId!
														);
														setShowModeDialog(true);
													}}
												>
													Tiếp tục học
												</Button>
											</CardFooter>
										</Card>
									</motion.div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center">
								<BookOpen className="mb-4 h-16 w-16 text-gray-300" />
								<h3 className="text-xl font-bold text-game-accent">
									Chưa có khóa học nào
								</h3>
								<p className="mb-4 text-game-accent/70">
									Bạn chưa bắt đầu học bất kỳ bộ từ vựng nào
								</p>
								<Button
									className="game-button"
									onClick={() => setActiveTab("explore")}
								>
									Khám phá các khóa học
								</Button>
							</div>
						)}
					</TabsContent>

					{/* Tab Khám phá */}
					<TabsContent value="explore" className="space-y-6">
						<div className="mb-4">
							<h2 className="text-2xl font-bold text-game-accent">
								Khóa học nổi bật
							</h2>
							<p className="text-game-accent/70">
								Các bộ từ vựng được đề xuất cho bạn
							</p>
						</div>

						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{allCourses
								.sort((a, b) => Math.random() - 0.5)
								.slice(0, 3)
								.map((course) => (
									<motion.div
										key={course.categoryId}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3 }}
										whileHover={{ y: -5 }}
									>
										<Card className="game-card h-full transition-all hover:border-game-primary/50">
											<CardHeader className="pb-2">
												<div className="flex justify-between">
													<Badge
														variant="outline"
														className="bg-game-primary/10 text-game-primary"
													>
														{
															DIFICULTY_LEVELS.find(
																(level) =>
																	level.value ==
																	course.difficultyLevel
															)?.label
														}
													</Badge>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-amber-500"
													>
														{/* {course.isBookmarked ? (
															<Bookmark className="h-4 w-4 fill-current" />
														) : (
															<Bookmark className="h-4 w-4" />
														)} */}
													</Button>
												</div>
												<CardTitle className="mt-2 text-xl text-game-accent">
													{course.categoryName}
												</CardTitle>
												<CardDescription className="text-game-accent/70">
													{course.description}
												</CardDescription>
											</CardHeader>
											<CardContent className="pb-2">
												<div className="flex flex-wrap gap-2">
													<Badge
														variant="outline"
														className="bg-gray-100"
													>
														{course.totalWords} từ
													</Badge>
													<Badge
														variant="outline"
														className="bg-gray-100"
													>
														{course.categoryName}
													</Badge>
													{/* {course.tags.map((tag) => (
														<Badge
															key={tag}
															variant="outline"
															className="bg-gray-100"
														>
															{tag}
														</Badge>
													))} */}
												</div>
											</CardContent>
											<CardFooter className="flex justify-between">
												<Button
													variant="outline"
													className="text-game-primary"
												>
													Xem trước
												</Button>
												<Button
													className="game-button"
													onClick={() => {
														setSelectedCourseId(
															course.categoryId
														);
														setShowModeDialog(true);
													}}
												>
													Bắt đầu học
												</Button>
											</CardFooter>
										</Card>
									</motion.div>
								))}
						</div>

						<div className="mb-4 mt-8">
							<h2 className="text-2xl font-bold text-game-accent">
								Tất cả khóa học
							</h2>
							<p className="text-game-accent/70">
								Khám phá tất cả các bộ từ vựng có sẵn
							</p>
						</div>

						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{allCourses.map((course) => (
								<motion.div
									key={course.categoryId}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
									whileHover={{ y: -5 }}
								>
									<Card className="game-card h-full transition-all hover:border-game-primary/50">
										<CardHeader className="pb-2">
											<div className="flex justify-between">
												<Badge
													variant="outline"
													className="bg-game-primary/10 text-game-primary"
												>
													{
														DIFICULTY_LEVELS.find(
															(level) =>
																level.value ==
																course.difficultyLevel
														)?.label
													}
												</Badge>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-amber-500"
												>
													{/* {course.isBookmarked ? (
														<Bookmark className="h-4 w-4 fill-current" />
													) : (
														<Bookmark className="h-4 w-4" />
													)} */}
												</Button>
											</div>
											<CardTitle className="mt-2 text-xl text-game-accent">
												{course.categoryName}
											</CardTitle>
											<CardDescription className="text-game-accent/70">
												{course.description}
											</CardDescription>
										</CardHeader>
										<CardContent className="pb-2">
											<div className="flex flex-wrap gap-2">
												<Badge
													variant="outline"
													className="bg-gray-100"
												>
													{course.totalWords} từ
												</Badge>
												<Badge
													variant="outline"
													className="bg-gray-100"
												>
													{course.categoryName}
												</Badge>
											</div>
										</CardContent>
										<CardFooter className="flex justify-between">
											<Button
												variant="outline"
												className="text-game-primary"
											>
												Xem trước
											</Button>
											<Button
												className="game-button"
												onClick={() => {
													setSelectedCourseId(
														course.categoryId
													);
													setShowModeDialog(true);
												}}
											>
												Bắt đầu học
											</Button>
										</CardFooter>
									</Card>
								</motion.div>
							))}
						</div>
					</TabsContent>

					{/* Tab Đã lưu */}
					<TabsContent value="bookmarked" className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filteredCourses
								.filter((course) => course.isBookmarked)
								.map((course) => (
									<motion.div
										key={course.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3 }}
										whileHover={{ y: -5 }}
									>
										<Card className="game-card h-full transition-all hover:border-game-primary/50">
											<CardHeader className="pb-2">
												<div className="flex justify-between">
													<Badge
														variant="outline"
														className="bg-game-primary/10 text-game-primary"
													>
														{course.level}
													</Badge>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-amber-500"
													>
														<Bookmark className="h-4 w-4 fill-current" />
													</Button>
												</div>
												<CardTitle className="mt-2 text-xl text-game-accent">
													{course.title}
												</CardTitle>
												<CardDescription className="text-game-accent/70">
													{course.description}
												</CardDescription>
											</CardHeader>
											<CardContent className="pb-2">
												<div className="flex flex-wrap gap-2">
													<Badge
														variant="outline"
														className="bg-gray-100"
													>
														{course.totalWords} từ
													</Badge>
													<Badge
														variant="outline"
														className="bg-gray-100"
													>
														{course.category}
													</Badge>
												</div>
											</CardContent>
											<CardFooter className="flex justify-between">
												<Button
													variant="outline"
													className="text-game-primary"
												>
													Xem trước
												</Button>
												<Button
													className="game-button"
													onClick={() => {
														setSelectedCourseId(
															course.id
														);
														setShowModeDialog(true);
													}}
												>
													Bắt đầu học
												</Button>
											</CardFooter>
										</Card>
									</motion.div>
								))}
						</div>

						{filteredCourses.filter((course) => course.isBookmarked)
							.length === 0 && (
							<div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center">
								<Bookmark className="mb-4 h-16 w-16 text-gray-300" />
								<h3 className="text-xl font-bold text-game-accent">
									Chưa có khóa học nào được lưu
								</h3>
								<p className="mb-4 text-game-accent/70">
									Bạn chưa lưu bất kỳ bộ từ vựng nào
								</p>
								<Button
									className="game-button"
									onClick={() => setActiveTab("explore")}
								>
									Khám phá các khóa học
								</Button>
							</div>
						)}
					</TabsContent>
				</Tabs>
				<VocabularyModeDialog
					open={showModeDialog}
					onOpenChange={setShowModeDialog}
					courseId={selectedCourseId}
					onRegister={handleRegister}
				/>
			</main>
		</div>
	);
}

const DIFICULTY_LEVELS = [
	{ value: 1, label: "Sơ cấp" },
	{ value: 2, label: "Trung cấp" },
	{ value: 3, label: "Cao cấp" },
	{ value: 4, label: "Nâng cao" },
];
