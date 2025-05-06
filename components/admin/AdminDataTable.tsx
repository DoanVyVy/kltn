"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface ColumnDef {
  header: string;
  accessorKey?: string;
  cell?: (row: any) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps {
  columns: ColumnDef[];
  data: any[] | undefined;
  isLoading: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  emptyMessage?: string;
  keyField?: string;
  showActions?: boolean;
  actionColumn?: React.ReactNode;
  enableHover?: boolean;
}

export default function AdminDataTable({
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
  onView,
  emptyMessage = "Không có dữ liệu",
  keyField = "id",
  showActions = true,
  actionColumn,
  enableHover = true,
}: AdminDataTableProps) {
  // Hiển thị skeleton khi đang tải
  if (isLoading) {
    return (
      <Card className="overflow-hidden border border-gray-200">
        <div className="space-y-2 p-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-gray-100" />
            ))}
        </div>
      </Card>
    );
  }

  // Hiển thị thông báo khi không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden border border-gray-200">
        <div className="flex h-32 items-center justify-center">
          <p className="text-center text-gray-500">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`text-gray-700 ${column.className || ""}`}
              >
                {column.header}
              </TableHead>
            ))}
            {showActions && (
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row[keyField] || rowIndex}
              className={`${enableHover ? "hover:bg-gray-50" : ""} transition-colors`}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className || ""}>
                  {column.cell
                    ? column.cell(row)
                    : column.accessorKey
                    ? row[column.accessorKey]
                    : null}
                </TableCell>
              ))}
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onView(row)}
                              className="h-8 w-8 text-blue-500 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem chi tiết</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {onEdit && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(row)}
                              className="h-8 w-8 text-blue-500 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sửa</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {onDelete && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(row)}
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {actionColumn}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
