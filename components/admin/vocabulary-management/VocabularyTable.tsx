import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type VocabularyWordListElement } from "@/routers/vocabulary_word.route";
import { Pencil, Trash2, Volume2 } from "lucide-react";
import React from "react";

interface VocabularyTableProps {
	vocabulary: VocabularyWordListElement[] | undefined;
	isLoading: boolean;
	openEditDialog: (word: VocabularyWordListElement) => void;
	openDeleteDialog: (word: VocabularyWordListElement) => void;
	playAudio: (url: string) => void;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	limit: number;
}

export default function VocabularyTable({
	vocabulary,
	isLoading,
	openEditDialog,
	openDeleteDialog,
	playAudio,
	page,
	setPage,
	limit,
}: VocabularyTableProps) {
	return (
		<Card>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Id</TableHead>
							<TableHead>Từ vựng</TableHead>
							<TableHead>Phiên âm</TableHead>
							<TableHead>Khóa học</TableHead>
							<TableHead>Định nghĩa</TableHead>
							<TableHead className="text-right">
								Thao tác
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-8"
								>
									Đang tải dữ liệu...
								</TableCell>
							</TableRow>
						) : vocabulary && vocabulary.length > 0 ? (
							vocabulary.map((word) => (
								<TableRow key={word.wordId}>
									<TableCell>{word.wordId}</TableCell>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											{word.word}
											{word.audioUrl && (
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() =>
														playAudio(
															word.audioUrl || ""
														)
													}
												>
													<Volume2 size={14} />
												</Button>
											)}
										</div>
									</TableCell>
									<TableCell>{word.pronunciation}</TableCell>
									<TableCell>
										{word.category?.categoryName ||
											"Chưa phân loại"}
									</TableCell>
									<TableCell className="max-w-xs truncate">
										{word.definition}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="icon"
												onClick={() =>
													openEditDialog(word)
												}
											>
												<Pencil size={16} />
											</Button>
											<Button
												variant="outline"
												size="icon"
												onClick={() =>
													openDeleteDialog(word)
												}
											>
												<Trash2 size={16} />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-8"
								>
									Không tìm thấy từ vựng nào
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				{vocabulary && vocabulary.length > 0 && (
					<div className="flex items-center justify-end p-4 space-x-2 border-t">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPage((prev) => Math.max(prev - 1, 1))
							}
							disabled={page === 1}
						>
							Trang trước
						</Button>
						<span className="mx-2">Trang {page}</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((prev) => prev + 1)}
							disabled={vocabulary.length < limit}
						>
							Trang tiếp
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
