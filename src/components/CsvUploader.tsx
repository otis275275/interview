"use client";

import { useState, useRef } from "react";

export default function CsvUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadResult({
        success: false,
        message: "Please select a CSV file to upload",
      });
      return;
    }

    // Verify file type
    if (!file.name.endsWith(".csv")) {
      setUploadResult({
        success: false,
        message: "Please select a valid CSV file",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: data.message,
          count: data.count,
        });
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFile(null);
      } else {
        setUploadResult({
          success: false,
          message: data.error || "Error uploading file",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResult({
        success: false,
        message: "Failed to upload file. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Button text that needs to be changed by the candidate
  const uploadButtonText = isUploading ? "Uploading..." : "Upload CSV";

  return (
    <div className="p-4 border rounded-lg bg-white mb-6">
      <h2 className="text-xl font-bold mb-4">CSV Data Upload</h2>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="csvFile" className="block text-sm font-medium mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            id="csvFile"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm border border-gray-300 rounded-md p-2"
            disabled={isUploading}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 rounded-md ${
              !file || isUploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {uploadButtonText} {/* TODO: Change this text to "Upload Users" */}
          </button>
        </div>

        {uploadResult && (
          <div
            className={`mt-4 p-3 rounded-md ${
              uploadResult.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <p>{uploadResult.message}</p>
            {uploadResult.success && uploadResult.count !== undefined && (
              <p className="mt-1">
                Successfully processed {uploadResult.count} records.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
