import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	CourseStatus,
	CreateCategoryInput,
	createCategorySchema,
	Difficulty,
} from "@/schema/category";
import { VocabularyCategory } from "@prisma/client";

const defaultValues = {
	difficulty: Difficulty.Easy,
	title: "",
	description: "",
	status: CourseStatus.Draft,
};

export function useCourseForm(initialData?: VocabularyCategory) {
	const form = useForm<CreateCategoryInput>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: initialData
			? {
					difficulty: initialData.difficultyLevel,
					title: initialData.categoryName,
					description: initialData.description || "",
					status: initialData.status as CourseStatus,
			  }
			: defaultValues,
	});

	const resetForm = () => {
		form.reset(defaultValues);
	};

	return {
		form,
		resetForm,
		defaultValues,
	};
}
