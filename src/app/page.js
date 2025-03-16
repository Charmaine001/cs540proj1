"use client";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    let process = availableProcesses[0]; // Get the shortest job
    time += process.burstTime; // Execute process
    result.push({ id: process.id, completionTime: time });

    readyQueue = readyQueue.filter((p) => p.id !== process.id); // Remove the executed process
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
const rrScheduling = (processes, timeQuantum) => {
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

const mlfqScheduling = (processes) => {
  let time = 0;
  let queues = [[], [], []]; // Three priority levels (index 0 is highest)
  let result = [];
  let timeQuanta = [2, 4, 8]; // Example time quanta for each priority level

  // Step 1: Assign processes to initial queues based on priority
  processes.forEach((p) => {
    let priorityIndex = Math.min(Math.max(p.priority - 1, 0), 2); // Assign based on priority
    queues[priorityIndex].push({ ...p, remainingTime: p.burstTime });
  });

  // Step 2: Process the queues
  while (queues.flat().length > 0) {
    let executed = false;

    for (let i = 0; i < queues.length; i++) {
      if (queues[i].length > 0) {
        let process = queues[i].shift(); // Get the first process in the queue
        let executionTime = Math.min(process.remainingTime, timeQuanta[i]); // Use time quantum or remaining time
        time += executionTime;
        process.remainingTime -= executionTime; // Decrease the remaining time

        if (process.remainingTime > 0) {
          // If the process isn't done, move it to the next lower priority queue
          if (i < queues.length - 1) {
            queues[i + 1].push(process); // Move to lower priority queue
          } else {
            queues[i].push(process); // Stay in the same queue if it's the lowest priority
          }
        } else {
          result.push({ id: process.id, completionTime: time }); // Add completed process to result
        }

        executed = true;
        break; // Ensure that we process the first available process in the current queue
      }
    }

    if (!executed) time++; // If no process was executed, increment time
  }

  return result;
};

const generateGradientColors = (data) => {
  const gradients = [];
  for (let i = 0; i < data.length; i++) {
    const ctx = document.createElement("canvas").getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 200); // Vertical gradient
    gradient.addColorStop(0, `hsl(${(i * 72) % 360}, 80%, 70%)`); // Brighter start color
    gradient.addColorStop(1, `hsl(${(i * 72) % 360}, 80%, 50%)`); // Brighter end color
    gradients.push(gradient);
  }
  return gradients;
};
const saveAsPDF = () => {
  // Get the results container element
  const resultsContainer = document.getElementById("results-container");

  // Use html2canvas to capture the content as an image
  html2canvas(resultsContainer).then((canvas) => {
    const imgData = canvas.toDataURL("image/png"); // Convert canvas to image data URL
    const pdf = new jsPDF("p", "mm", "a4"); // Create a new PDF in portrait mode, A4 size

    // Calculate dimensions for the image in the PDF
    const imgWidth = 190; // Width of the image in the PDF (190mm for A4)
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    // Save the PDF file
    pdf.save("scheduling_results.pdf");
  });
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
        console.log("fifo Results:", data); 
        break;
      case "SJF":
        data = sjfScheduling([...processes]);
        console.log("sjf Results:", data); 
        break;
      case "STCF":
        data = stcfScheduling([...processes]);
        console.log("stcf Results:", data); 
        break;
      case "RR":
        data = rrScheduling([...processes], timeQuantum);
        console.log("rr Results:", data); 
        break;
      case "MLFQ":
        data = mlfqScheduling([...processes]);
        console.log("MLFQ Results:", data); 
        break;
      default:
        return;
    }
    setResults((prev) => ({ ...prev, [algo]: data }));
    
  };

  const runAllAlgorithms = () => {
    const processes = generateProcesses(numProcesses);
    console.log("Generated Processes:", processes); // Log processes
  
     // Run MLFQ
    console.log("Running MLFQ...");
    const mlfqResults = mlfqScheduling([...processes]);
    console.log("MLFQ Results:", mlfqResults); // Log MLFQ results
    setResults((prevResults) => ({
      ...prevResults,
      MLFQ: mlfqResults,
    }));
    // Run FIFO
    console.log("Running FIFO...");
    const fifoResults = fifoScheduling([...processes]);
    console.log("FIFO Results:", fifoResults); // Log FIFO results
    setResults((prevResults) => ({
      ...prevResults,
      FIFO: fifoResults,
    }));

    // Run SJF
    console.log("Running SJF...");
    const sjfResults = sjfScheduling([...processes]);
    console.log("SJF Results:", sjfResults); // Log SJF results
    setResults((prevResults) => ({
      ...prevResults,
      SJF: sjfResults,
    }));

    // Run STCF
    console.log("Running STCF...");
    const stcfResults = stcfScheduling([...processes]);
    console.log("STCF Results:", stcfResults); // Log STCF results
    setResults((prevResults) => ({
      ...prevResults,
      STCF: stcfResults,
    }));

    // Run RR
    console.log("Running RR...");
    const rrResults = rrScheduling([...processes], timeQuantum);
    console.log("RR Results:", rrResults); // Log RR results
    setResults((prevResults) => ({
      ...prevResults,
      RR: rrResults,
    }));

  };
  
  return (
    <div className="container mx-auto p-5">
      <h1 className="text-xl font-bold">CPU Scheduling Simulator</h1>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Number of Processes</label>
          <input
            type="number"
            value={numProcesses}
            onChange={(e) => setNumProcesses(Number(e.target.value))}
            className="border p-2"
            placeholder="Number of processes"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time Quantum (for RR)</label>
          <input
            type="number"
            value={timeQuantum}
            onChange={(e) => setTimeQuantum(Number(e.target.value))}
            className="border p-2"
            placeholder="Time Quantum"
          />
        </div>
      </div>
      <div className="flex gap-4 mt-3">
        <button className="bg-blue-500 text-white p-2" onClick={runAllAlgorithms}>
          Run All Algorithms
        </button>
        {["MLFQ", "FIFO", "SJF", "STCF", "RR"].map((algo) => (
          <button
            key={algo}
            className="bg-green-500 text-white p-2"
            onClick={() => runAlgorithm(algo)}
          >
            Run {algo}
          </button>
        ))}
        <button className="bg-purple-500 text-white p-2" onClick={saveAsPDF}>
          Save as PDF
        </button>
      </div>

      {/* Results Container */}
      <div id="results-container" className="grid grid-cols-2 gap-4 mt-5">
        {Object.entries(results).map(([algo, data]) => {
          const gradientColors = generateGradientColors(data);
          return (
            <div key={algo} className="border p-4">
              <h2 className="text-lg font-bold">{algo} Results</h2>
              <Bar
                data={{
                  labels: data.map((p) => `P${p.id}`),
                  datasets: [
                    {
                      label: "Completion Time",
                      data: data.map((p) => p.completionTime),
                      backgroundColor: gradientColors,
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      borderWidth: 1,
                      hoverBackgroundColor: gradientColors,
                      hoverBorderColor: "rgba(0, 0, 0, 0.3)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  animation: {
                    duration: 1000,
                    easing: "easeInOutQuad",
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: "Time",
                      },
                      beginAtZero: true,
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Processes",
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      enabled: true,
                      mode: "index",
                      intersect: false,
                    },
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SchedulerApp;