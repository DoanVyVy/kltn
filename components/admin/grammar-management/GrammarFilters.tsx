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
import { Category } from "@prisma/client";

interface GrammarFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: Category[] | undefined;
}

export default function GrammarFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
}: GrammarFiltersProps) {
  return (
    <CardContent className="p-4 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm ngữ pháp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khóa học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khóa học</SelectItem>
              {categories?.map((category) => (
                <SelectItem
                  key={category.categoryId}
                  value={category.categoryId.toString()}
                >
                  {category.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  );
}
