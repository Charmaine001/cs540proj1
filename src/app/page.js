"use client";
import Image from "next/image";
import Link from "next/link";

import { useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

// Function to generate random processes
const generateProcesses = (num) => {
  let processes = [];
  for (let i = 0; i < num; i++) {
    processes.push({
      id: i + 1, // Assign unique ID
      arrivalTime: Math.floor(Math.random() * 10), // Random arrival time
      burstTime: Math.floor(Math.random() * 10) + 1, // Random burst time (1-10)
      priority: Math.floor(Math.random() * 3) + 1, // Priority (1-3) for MLFQ
    });
  }
  return processes;
};

// First Come, First Served (FIFO) Scheduling
const fifoScheduling = (processes) => {
  let time = 0; // Track the current time
  let result = []; // Store results

  processes.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort by arrival time

  processes.forEach((p) => {
    if (time < p.arrivalTime) time = p.arrivalTime; // Wait for process if needed
    time += p.burstTime; // Increment time by burst duration
    result.push({ id: p.id, completionTime: time });
  });

  return result;
};

// Shortest Job First (SJF) Scheduling
const sjfScheduling = (processes) => {
  let time = 0;
  let result = [];
  let readyQueue = [...processes];

  readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort by arrival time

  while (readyQueue.length > 0) {
    let availableProcesses = readyQueue.filter((p) => p.arrivalTime <= time);

    if (availableProcesses.length === 0) {
      time = readyQueue[0].arrivalTime;
      continue;
    }

    availableProcesses.sort((a, b) => a.burstTime - b.burstTime); // Pick shortest job

    let process = availableProcesses.shift(); // Get the shortest job
    time += process.burstTime; // Execute process
    result.push({ id: process.id, completionTime: time });

    readyQueue = readyQueue.filter((p) => p.id !== process.id);
  }

  return result;
};

// Shortest Time-to-Completion First (STCF) Scheduling
const stcfScheduling = (processes) => {
  let time = 0;
  let result = [];
  let remainingProcesses = [...processes];

  while (remainingProcesses.length > 0) {
    let availableProcesses = remainingProcesses.filter((p) => p.arrivalTime <= time);

    if (availableProcesses.length === 0) {
      time = remainingProcesses[0].arrivalTime;
      continue;
    }

    availableProcesses.sort((a, b) => a.burstTime - b.burstTime); // Pick shortest remaining time
    let process = availableProcesses[0];

    time += 1;
    process.burstTime -= 1; // Reduce burst time

    if (process.burstTime === 0) {
      result.push({ id: process.id, completionTime: time });
      remainingProcesses = remainingProcesses.filter((p) => p.id !== process.id);
    }
  }

  return result;
};

// Round Robin (RR) Scheduling
const roundRobinScheduling = (processes, timeQuantum) => {
  let time = 0;
  let result = [];
  let queue = [...processes];

  queue.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort by arrival time

  while (queue.length > 0) {
    let process = queue.shift();

    if (time < process.arrivalTime) time = process.arrivalTime; // Wait if process not arrived

    if (process.burstTime > timeQuantum) {
      time += timeQuantum;
      process.burstTime -= timeQuantum;
      queue.push(process); // Reinsert into queue
    } else {
      time += process.burstTime;
      result.push({ id: process.id, completionTime: time });
    }
  }

  return result;
};

// Multi-Level Feedback Queue (MLFQ) Scheduling
const mlfqScheduling = (processes) => {
  let time = 0;
  let queues = [[], [], []]; // Three priority levels
  let result = [];

  processes.forEach((p) => {
    let priorityIndex = Math.min(Math.max(p.priority - 1, 0), 2); // Ensure valid priority
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