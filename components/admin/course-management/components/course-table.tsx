import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { VocabularyCategory } from "@prisma/client";
import { DifficultyDisplay } from "@/schema/category";
import StatusBadge from "./status-badge";

interface CourseTableProps {
	courses: VocabularyCategory[];
	onEdit: (course: VocabularyCategory) => void;
	onDelete: (course: VocabularyCategory) => void;
}

export default function CourseTable({
	courses,
	onEdit,
	onDelete,
}: CourseTableProps) {
	return (
		<CardContent className="p-0">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Id</TableHead>
						<TableHead>Cấp độ</TableHead>
						<TableHead>Tiêu đề</TableHead>
						<TableHead>Mô tả</TableHead>
						<TableHead>Số từ vựng</TableHead>
						<TableHead>Số điểm ngữ pháp</TableHead>
						<TableHead>Trạng thái</TableHead>
						<TableHead className="text-right">Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{courses.map((course) => (
						<TableRow key={course.categoryId}>
							<TableCell>{course.categoryId}</TableCell>
							<TableCell className="font-medium">
								{
									DifficultyDisplay[
										course.difficultyLevel as keyof typeof DifficultyDisplay
									]
								}
							</TableCell>
							<TableCell>{course.categoryName}</TableCell>
							<TableCell className="max-w-xs truncate">
								{course.description}
							</TableCell>
							<TableCell>{course.totalWords}</TableCell>
							<TableCell>{course.totalWords}</TableCell>
							<TableCell>
								<StatusBadge status={course.status as any} />
							</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										size="icon"
										onClick={() => onEdit(course)}
									>
										<Pencil size={16} />
									</Button>
									<Button
										variant="outline"
										size="icon"
										onClick={() => onDelete(course)}
									>
										<Trash2 size={16} />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</CardContent>
	);
}
