import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const data = {
    labels: ["Electronics", "Groceries", "Clothing", "Home Goods", "Beauty"], // Labels for categories
    datasets: [
      {
        label: "Category Distribution", // Dataset label
        data: [300, 500, 200, 400, 100], // Dummy data values for each category
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)", // Color for each slice
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 2, // Border width for each slice
        hoverOffset: 10, // Offset on hover
        radius: "80%", // Decrease the radius to 80% of the default
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right", // Display legend on the right side
        labels: {
          boxWidth: 20, // Width of the legend box
          padding: 20, // Space between legend items
          font: {
            size: 14, // Font size for labels
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.7)", // Background color for tooltips
        bodyFont: {
          size: 16, // Font size for tooltip
        },
        padding: 10,
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
