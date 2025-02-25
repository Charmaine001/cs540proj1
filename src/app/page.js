import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4 flex flex-col items-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">CPU Scheduling Algorithms</h1>
      <p className="mb-4">Choose an algorithm to run:</p>
      <Link href="/fifo" className="bg-blue-500 text-white px-4 py-2 rounded">
        Go to FIFO Scheduling
      </Link>
    </div>
  );
}
