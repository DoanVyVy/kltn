import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CourseStatus, CourseStatusDisplayMap } from "@/schema/category";

interface SearchFiltersProps {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	statusFilter: string;
	setStatusFilter: (value: string) => void;
}

export default function SearchFilters({
	searchTerm,
	setSearchTerm,
	statusFilter,
	setStatusFilter,
}: SearchFiltersProps) {
	return (
		<CardContent className="p-4">
			<div className="flex gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Tìm kiếm khóa học..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả trạng thái</SelectItem>
						{Object.values(CourseStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{CourseStatusDisplayMap[status]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</CardContent>
	);
}
