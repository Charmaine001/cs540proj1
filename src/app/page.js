"use client";
import Image from "next/image";
import Link from "next/link";


import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

// Function to generate random processes
const generateProcesses = (num) => {
  return Array.from({ length: num }, (_, i) => ({
    id: i + 1,
    arrivalTime: Math.floor(Math.random() * 10),
    burstTime: Math.floor(Math.random() * 10) + 1,
    priority: Math.floor(Math.random() * 5) + 1, // Used in MLFQ
  }));
};

// FIFO Algorithm
const fifoScheduling = (processes) => {
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  let time = 0,
    result = [];
  processes.forEach((p) => {
    time = Math.max(time, p.arrivalTime) + p.burstTime;
    result.push({ id: p.id, completionTime: time });
  });
  return result;
};

// SJF Algorithm
const sjfScheduling = (processes) => {
  let time = 0,
    result = [];
  let remaining = [...processes];

  while (remaining.length > 0) {
    remaining = remaining.filter((p) => p.arrivalTime <= time);
    if (remaining.length === 0) break;
    remaining.sort((a, b) => a.burstTime - b.burstTime);
    let process = remaining.shift();
    time += process.burstTime;
    result.push({ id: process.id, completionTime: time });
  }
  return result;
};

// STCF Algorithm
const stcfScheduling = (processes) => {
  let time = 0,
    remaining = [...processes],
    result = [];

  while (remaining.length > 0) {
    remaining = remaining.filter((p) => p.arrivalTime <= time);
    if (remaining.length === 0) {
      time++;
      continue;
    }
    remaining.sort((a, b) => a.burstTime - b.burstTime);
    let process = remaining[0];
    process.burstTime -= 1;
    time++;

    if (process.burstTime === 0) {
      result.push({ id: process.id, completionTime: time });
      remaining.shift();
    }
  }
  return result;
};

// RR Algorithm
const rrScheduling = (processes, quantum) => {
  let time = 0,
    queue = [...processes],
    result = [];

  while (queue.length > 0) {
    let process = queue.shift();
    if (process.burstTime > quantum) {
      process.burstTime -= quantum;
      time += quantum;
      queue.push(process);
    } else {
      time += process.burstTime;
      result.push({ id: process.id, completionTime: time });
    }
  }
  return result;
};

// MLFQ Algorithm
const mlfqScheduling = (processes) => {
  let time = 0;
  let queues = [[], [], []]; // Ensure all queues exist
  let result = [];

  // Ensure priority is within range 1-3
  processes.forEach((p) => {
    let priorityIndex = Math.min(Math.max(p.priority - 1, 0), 2);
    queues[priorityIndex].push(p);
  });

  while (queues.flat().length > 0) {
    for (let q of queues) {
      if (q.length > 0) {
        let process = q.shift();
        time += process.burstTime;
        result.push({ id: process.id, completionTime: time });
        break;
      }
    }
  }
  return result;
};


// Main Component
const SchedulerApp = () => {
  const [numProcesses, setNumProcesses] = useState(5);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [processes, setProcesses] = useState(generateProcesses(numProcesses));
  const [results, setResults] = useState({});

  useEffect(() => {
    setProcesses(generateProcesses(numProcesses));
  }, [numProcesses]);

  const runAlgorithm = (algo) => {
    let data;
    switch (algo) {
      case "FIFO":
        data = fifoScheduling([...processes]);
        break;
      case "SJF":
        data = sjfScheduling([...processes]);
        break;
      case "STCF":
        data = stcfScheduling([...processes]);
        break;
      case "RR":
        data = rrScheduling([...processes], timeQuantum);
        break;
      case "MLFQ":
        data = mlfqScheduling([...processes]);
        break;
      default:
        return;
    }
    setResults((prev) => ({ ...prev, [algo]: data }));
  };

  const runAllAlgorithms = () => {
    setResults({
      FIFO: fifoScheduling([...processes]),
      SJF: sjfScheduling([...processes]),
      STCF: stcfScheduling([...processes]),
      RR: rrScheduling([...processes], timeQuantum),
      MLFQ: mlfqScheduling([...processes]),
    });
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-xl font-bold">CPU Scheduling Simulator</h1>
      <div className="flex gap-4">
        <input
          type="number"
          value={numProcesses}
          onChange={(e) => setNumProcesses(Number(e.target.value))}
          className="border p-2"
          placeholder="Number of processes"
        />
        <input
          type="number"
          value={timeQuantum}
          onChange={(e) => setTimeQuantum(Number(e.target.value))}
          className="border p-2"
          placeholder="Time Quantum (for RR)"
        />
      </div>
      <div className="flex gap-4 mt-3">
        <button className="bg-blue-500 text-white p-2" onClick={runAllAlgorithms}>
          Run All Algorithms
        </button>
        {["FIFO", "SJF", "STCF", "RR", "MLFQ"].map((algo) => (
          <button
            key={algo}
            className="bg-green-500 text-white p-2"
            onClick={() => runAlgorithm(algo)}
          >
            Run {algo}
          </button>
        ))}
      </div>

      {/* Display Results */}
      {Object.entries(results).map(([algo, data]) => (
        <div key={algo} className="mt-5">
          <h2 className="text-lg font-bold">{algo} Results</h2>
          <Bar
            data={{
              labels: data.map((p) => `P${p.id}`),
              datasets: [
                {
                  label: "Completion Time",
                  data: data.map((p) => p.completionTime),
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
              ],
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default SchedulerApp;
