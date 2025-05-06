import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Sao chép hàm cn từ lib/utils nếu không thể import
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPageNumbers?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxPageNumbers = 5,
}: PaginationProps) {
  // Tính toán số trang hiển thị
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= maxPageNumbers) {
      // Hiển thị tất cả số trang nếu tổng số trang ít hơn maxPageNumbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pageNumbers.push(1);

      // Nếu trang hiện tại ở gần đầu
      if (currentPage <= 3) {
        pageNumbers.push(2, 3, 4, "...");
      }
      // Nếu trang hiện tại ở gần cuối
      else if (currentPage >= totalPages - 2) {
        pageNumbers.push("...", totalPages - 3, totalPages - 2, totalPages - 1);
      }
      // Nếu trang hiện tại ở giữa
      else {
        pageNumbers.push(
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "..."
        );
      }

      // Luôn hiển thị trang cuối cùng
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, index) => (
        <Button
          key={index}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            currentPage === page ? "bg-game-primary text-white" : ""
          )}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={typeof page !== "number"}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
