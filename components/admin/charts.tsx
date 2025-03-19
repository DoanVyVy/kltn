"use client"

import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export function LineChart() {
  const data = {
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
    datasets: [
      {
        label: "Người dùng hoạt động",
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 500) + 300),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return <Line data={data} options={options} height={300} />
}

export function BarChart() {
  const data = {
    labels: ["Từ vựng", "Ngữ pháp", "Đoán từ", "Xếp câu", "Liên kết từ", "Thành ngữ"],
    datasets: [
      {
        label: "Số lượng hoàn thành",
        data: [450, 320, 280, 205, 190, 150],
        backgroundColor: [
          "rgba(99, 102, 241, 0.6)",
          "rgba(79, 70, 229, 0.6)",
          "rgba(67, 56, 202, 0.6)",
          "rgba(55, 48, 163, 0.6)",
          "rgba(49, 46, 129, 0.6)",
          "rgba(30, 27, 75, 0.6)",
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(79, 70, 229)",
          "rgb(67, 56, 202)",
          "rgb(55, 48, 163)",
          "rgb(49, 46, 129)",
          "rgb(30, 27, 75)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return <Bar data={data} options={options} height={300} />
}

export function PieChart() {
  const data = {
    labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    datasets: [
      {
        label: "Người dùng",
        data: [350, 420, 280, 120, 60, 20],
        backgroundColor: [
          "rgba(99, 102, 241, 0.6)",
          "rgba(79, 70, 229, 0.6)",
          "rgba(67, 56, 202, 0.6)",
          "rgba(55, 48, 163, 0.6)",
          "rgba(49, 46, 129, 0.6)",
          "rgba(30, 27, 75, 0.6)",
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(79, 70, 229)",
          "rgb(67, 56, 202)",
          "rgb(55, 48, 163)",
          "rgb(49, 46, 129)",
          "rgb(30, 27, 75)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  }

  return <Pie data={data} options={options} />
}

