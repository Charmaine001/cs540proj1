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

export default SchedulerApp;
