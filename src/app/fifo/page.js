"use client";

import { useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function FIFOPage() {
  const [processes, setProcesses] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Generate random processes
  const generateProcesses = () => {
    const num = 5; // Number of processes
    const newProcesses = [];
    for (let i = 0; i < num; i++) {
      newProcesses.push({
        id: i + 1,
        arrivalTime: i * 2, // Simulating staggered arrivals
        burstTime: Math.floor(Math.random() * 10) + 1, // Random burst time
      });
    }
    setProcesses(newProcesses);
  };

  // Run FIFO scheduling
  const runFIFO = () => {
    if (processes.length === 0) return;

    let time = 0;
    let completionTimes = [];
    let waitingTimes = [];
    let turnaroundTimes = [];

    processes.forEach((process) => {
      if (time < process.arrivalTime) time = process.arrivalTime;
      let completionTime = time + process.burstTime;
      completionTimes.push(completionTime);

      let turnaroundTime = completionTime - process.arrivalTime;
      turnaroundTimes.push(turnaroundTime);

      let waitingTime = turnaroundTime - process.burstTime;
      waitingTimes.push(waitingTime);

      time = completionTime;
    });

    setChartData({
      labels: processes.map((p) => `P${p.id}`),
      datasets: [
        {
          label: "Completion Time",
          data: completionTimes,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
        {
          label: "Turnaround Time",
          data: turnaroundTimes,
          backgroundColor: "rgba(255, 206, 86, 0.5)",
        },
        {
          label: "Waiting Time",
          data: waitingTimes,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">FIFO Scheduling</h2>
      <button
        onClick={generateProcesses}
        className="bg-blue-500 text-white px-4 py-2 mr-2 rounded"
      >
        Generate Processes
      </button>
      <button
        onClick={runFIFO}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Run FIFO
      </button>
      {chartData && (
        <div className="mt-4">
          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
}
