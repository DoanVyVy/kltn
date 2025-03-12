// Utility functions for dashboard components

/**
 * Format a number with commas as thousands separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("vi-VN")
}

/**
 * Calculate the percentage of a value relative to a total
 */
export function calculatePercentage(value: number, total: number): number {
  return Math.round((value / total) * 100)
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

/**
 * Get category label based on category type
 */
export function getCategoryLabel(category: "vocabulary" | "grammar"): string {
  return category === "vocabulary" ? "Từ vựng" : "Ngữ pháp"
}

/**
 * Get relative time string (e.g., "Hôm nay", "Hôm qua", "3 ngày trước")
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Hôm nay"
  if (diffInDays === 1) return "Hôm qua"
  if (diffInDays < 7) return `${diffInDays} ngày trước`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`
  return `${Math.floor(diffInDays / 365)} năm trước`
}

