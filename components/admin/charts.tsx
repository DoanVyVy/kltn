"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Đăng ký tất cả các thành phần Chart.js
Chart.register(...registerables);

interface ChartProps {
  data: any;
  height?: number;
  width?: number;
}

// Biểu đồ đường
const LineChart = ({ data, height = 300, width }: ChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Hủy biểu đồ cũ nếu tồn tại
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Khởi tạo biểu đồ mới
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                // Loại bỏ thuộc tính borderDash không được hỗ trợ
                color: "rgba(0,0,0,0.1)",
                lineWidth: 1,
              },
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div
      style={{ height: `${height}px`, width: width ? `${width}px` : "100%" }}
    >
      <canvas ref={chartRef} />
    </div>
  );
};

// Biểu đồ cột
const BarChart = ({ data, height = 300, width }: ChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Hủy biểu đồ cũ nếu tồn tại
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Khởi tạo biểu đồ mới
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                // Loại bỏ thuộc tính borderDash không được hỗ trợ
                color: "rgba(0,0,0,0.1)",
                lineWidth: 1,
              },
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div
      style={{ height: `${height}px`, width: width ? `${width}px` : "100%" }}
    >
      <canvas ref={chartRef} />
    </div>
  );
};

// Biểu đồ tròn
const PieChart = ({ data, height = 300, width }: ChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Hủy biểu đồ cũ nếu tồn tại
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Khởi tạo biểu đồ mới
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "right",
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div
      style={{ height: `${height}px`, width: width ? `${width}px` : "100%" }}
    >
      <canvas ref={chartRef} />
    </div>
  );
};

// Biểu đồ doughnut
const DoughnutChart = ({ data, height = 300, width }: ChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Hủy biểu đồ cũ nếu tồn tại
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Khởi tạo biểu đồ mới
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "right",
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div
      style={{ height: `${height}px`, width: width ? `${width}px` : "100%" }}
    >
      <canvas ref={chartRef} />
    </div>
  );
};

// Biểu đồ radar
const RadarChart = ({ data, height = 300, width }: ChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Hủy biểu đồ cũ nếu tồn tại
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Khởi tạo biểu đồ mới
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "radar",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
          },
          scales: {
            r: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div
      style={{ height: `${height}px`, width: width ? `${width}px` : "100%" }}
    >
      <canvas ref={chartRef} />
    </div>
  );
};

// Export tất cả các biểu đồ
export const AdminCharts = {
  LineChart,
  BarChart,
  PieChart,
  DoughnutChart,
  RadarChart,
};
