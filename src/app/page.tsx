"use client";

import { useState } from "react";
import UserTable from "@/components/UserTable";
import CsvUploader from "@/components/CsvUploader";

interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium";
  completed: boolean;
}

export default function CodingChallenge() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Add Email Validation",
      description:
        "Add a simple validation to check if an email ends with '.com' in the UserTable component.",
      difficulty: "Easy",
      completed: false,
    },
    {
      id: 2,
      title: "Fix CSV Upload Duplicates",
      description:
        "When uploading the CSV from src\\data\\sampleUsers.csv, an error occurs: 'Failed to process CSV: Error: Duplicate entries found in CSV. Validation error'. Add a truncateTable() function in src\\utils\\csvParser.ts before the parseCsvToDatabase function. The function should clear existing records before new ones are inserted.",
      difficulty: "Medium",
      completed: false,
    },
    {
      id: 3,
      title: "Fix CSV Upload Button",
      description:
        "The CSV uploader button isn't showing the correct text. Update it to show 'Upload Users' instead of 'Upload CSV'.",
      difficulty: "Easy",
      completed: false,
    },
  ]);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 sm:p-8 max-w-5xl mx-auto bg-white">
      <header className="w-full text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
          Coding Challenge
        </h1>
        <p className="text-lg text-gray-500">
          Full Stack Developer Interview — 30 minutes
        </p>
      </header>

      <section className="w-full mb-10 p-6 bg-blue-50 rounded-xl shadow">
        <h2 className="text-2xl font-semibold text-blue-900 mb-4">
          Instructions
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          <li>
            This is a quick exercise to assess your ability to work with
            existing React code.
          </li>
          <li>
            <strong>Time limit:</strong> 30 minutes
          </li>
          <li>
            <strong>Goal:</strong> Complete all tasks below. Your updates should
            be clean, readable, and effective.
          </li>
        </ul>
      </section>

      <section className="w-full mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Tasks</h2>
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start p-4 border rounded-lg shadow-sm transition-colors ${
                task.completed ? "bg-green-50 border-green-200" : "bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400 mr-4"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {task.title}
                  </h3>
                  <span
                    className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      task.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {task.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full mb-10 p-6 bg-gray-50 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Working Application
        </h2>
        <p className="text-gray-700 mb-6">
          Below are the components you&apos;ll be working on. Test them and make
          your improvements accordingly.
        </p>
        <div className="space-y-6">
          <CsvUploader />
          <UserTable />
        </div>
      </section>

      <section className="w-full mb-6 p-6 bg-yellow-50 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3 text-yellow-900">
          Evaluation Criteria
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-gray-800">
          <li>Clear understanding of component structures and props</li>
          <li>Ability to make isolated, purposeful changes</li>
          <li>Proficiency with React and TypeScript fundamentals</li>
        </ul>
      </section>
    </main>
  );
}
