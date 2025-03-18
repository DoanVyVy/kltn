import { Badge } from "@/components/ui/badge";
import { CourseStatus, CourseStatusDisplayMap } from "@/schema/category";

interface StatusBadgeProps {
	status: CourseStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
	if (!status) status = CourseStatus.Active;

	const variantMap = {
		[CourseStatus.Draft]: "secondary",
		[CourseStatus.Active]: "default",
		[CourseStatus.Archived]: "outline",
		[CourseStatus.Hidden]: "outline",
	};

	return (
		<Badge variant={variantMap[status] as any}>
			{CourseStatusDisplayMap[status]}
		</Badge>
	);
}
