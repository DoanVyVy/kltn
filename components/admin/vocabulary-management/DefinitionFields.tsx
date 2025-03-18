import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CreateVocabularyInput } from "@/schema/vocabulary";

interface DefinitionFieldsProps {
	index: number;
	fields: Record<"id", string>[];
	register: UseFormRegister<CreateVocabularyInput>;
	errors: FieldErrors<CreateVocabularyInput>;
	remove: (index: number) => void;
}

export default function DefinitionFields({
	index,
	fields,
	register,
	errors,
	remove,
}: DefinitionFieldsProps) {
	return (
		<div className="border p-4 rounded-md mb-4">
			<div className="flex justify-between items-center mb-2">
				<h4 className="font-medium">Định nghĩa {index + 1}</h4>
				{fields.length > 1 && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => remove(index)}
					>
						<X size={16} />
					</Button>
				)}
			</div>
			<div className="grid gap-4">
				<div className="grid grid-cols-4 items-center gap-4">
					<Label
						htmlFor={`definitions.${index}.type`}
						className="text-right"
					>
						Loại từ
					</Label>
					<div className="col-span-3">
						<select
							id={`definitions.${index}.type`}
							{...register(`definitions.${index}.type`)}
							className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="noun">Danh từ</option>
							<option value="verb">Động từ</option>
							<option value="adjective">Tính từ</option>
							<option value="adverb">Trạng từ</option>
							<option value="preposition">Giới từ</option>
							<option value="conjunction">Liên từ</option>
							<option value="pronoun">Đại từ</option>
							<option value="interjection">Thán từ</option>
						</select>
						{errors.definitions?.[index]?.type && (
							<p className="text-red-500 text-sm mt-1">
								{errors.definitions[index]?.type?.toString()}
							</p>
						)}
					</div>
				</div>
				<div className="grid grid-cols-4 items-center gap-4">
					<Label
						htmlFor={`definitions.${index}.definition`}
						className="text-right"
					>
						Định nghĩa
					</Label>
					<div className="col-span-3">
						<Textarea
							id={`definitions.${index}.definition`}
							{...register(`definitions.${index}.definition`)}
							className={
								errors.definitions?.[index]?.definition
									? "border-red-500"
									: ""
							}
						/>
						{errors.definitions?.[index]?.definition && (
							<p className="text-red-500 text-sm mt-1">
								{errors.definitions[index]?.definition?.message}
							</p>
						)}
					</div>
				</div>
				<div className="grid grid-cols-4 items-center gap-4">
					<Label
						htmlFor={`definitions.${index}.example`}
						className="text-right"
					>
						Ví dụ
					</Label>
					<div className="col-span-3">
						<Textarea
							id={`definitions.${index}.example`}
							{...register(`definitions.${index}.example`)}
							className={
								errors.definitions?.[index]?.example
									? "border-red-500"
									: ""
							}
						/>
						{errors.definitions?.[index]?.example && (
							<p className="text-red-500 text-sm mt-1">
								{errors.definitions[index]?.example?.message}
							</p>
						)}
					</div>
				</div>
				<div className="grid grid-cols-4 items-center gap-4">
					<Label
						htmlFor={`definitions.${index}.translation`}
						className="text-right"
					>
						Dịch nghĩa
					</Label>
					<div className="col-span-3">
						<Textarea
							id={`definitions.${index}.translation`}
							{...register(`definitions.${index}.translation`)}
							className={
								errors.definitions?.[index]?.translation
									? "border-red-500"
									: ""
							}
						/>
						{errors.definitions?.[index]?.translation && (
							<p className="text-red-500 text-sm mt-1">
								{
									errors.definitions[index]?.translation
										?.message
								}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
