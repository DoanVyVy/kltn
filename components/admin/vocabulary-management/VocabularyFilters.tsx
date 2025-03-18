import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface VocabularyFiltersProps {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	selectedCourse: string;
	setSelectedCourse: (value: string) => void;
	courses: any[] | undefined;
}

export default function VocabularyFilters({
	searchTerm,
	setSearchTerm,
	selectedCourse,
	setSelectedCourse,
	courses,
}: VocabularyFiltersProps) {
	return (
		<CardContent className="p-4">
			<div className="flex gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Tìm kiếm từ vựng..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select
					value={selectedCourse}
					onValueChange={setSelectedCourse}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Chọn khóa học" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả khóa học</SelectItem>
						{courses?.map((course) => (
							<SelectItem
								key={course.categoryId}
								value={course.categoryId.toString()}
							>
								{course.difficultyLevel} - {course.categoryName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</CardContent>
	);
}
