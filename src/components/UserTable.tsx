"use client";

import { useState, useEffect } from "react";

// Define the User interface
interface User {
  id: number;
  name: string;
  email: string;
  age: number | null;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const attemptFetch = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");

        // Add retry logic for 500 errors
        if (response.status === 500) {
          console.log("Server error encountered, retrying...");
          // Wait 1 second before retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const retryResponse = await fetch("/api/users");

          if (!retryResponse.ok) {
            let errorDetails = "";
            try {
              // Clone the response before reading it
              const clonedResponse = retryResponse.clone();
              try {
                const errorData = await retryResponse.json();
                errorDetails = errorData.message || "";
              } catch (e) {
                // JSON parsing failed, use text instead
                errorDetails = await clonedResponse.text();
                console.error("Error parsing retry response:", e);
              }
            } catch (e) {
              // If both methods fail, use status text
              errorDetails = retryResponse.statusText;
              console.error("Error reading response:", e);
            }

            setError(
              `Unable to fetch users: ${retryResponse.status} ${
                errorDetails ? `- ${errorDetails}` : ""
              }`
            );
            return;
          }

          const data = await retryResponse.json();
          setUsers(data);
          setError(null);
          return;
        }

        // Handle normal response
        if (!response.ok) {
          let errorDetails = "";
          try {
            // Clone the response before reading it
            const clonedResponse = response.clone();
            try {
              const errorData = await response.json();
              errorDetails = errorData.message || "";
            } catch (e) {
              // If we can't parse JSON, try to get text
              errorDetails = await clonedResponse.text();
              console.error("Error parsing response:", e);
            }
          } catch (e) {
            // If both methods fail, use status text
            errorDetails = response.statusText;
            console.error("Error reading response:", e);
          }

          setError(
            `Failed to fetch users: ${response.status} ${
              errorDetails ? `- ${errorDetails}` : ""
            }`
          );
          return;
        }

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        // Handle network errors or other exceptions
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Error fetching users: ${errorMessage}`);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    return attemptFetch();
  };

  // Delete user function - works but not connected to the button yet
  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Get more detailed error information if available
        let errorDetails = "";
        try {
          // Clone the response before reading it
          const clonedResponse = response.clone();
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || "";
          } catch {
            // If response body can't be parsed, use text
            errorDetails = await clonedResponse.text();
          }
        } catch {
          // If both methods fail, use status text
          errorDetails = response.statusText;
        }

        throw new Error(
          `Failed to delete user: ${response.status} ${
            errorDetails ? `- ${errorDetails}` : ""
          }`
        );
      }

      // If successful, update the local state to remove the user
      setUsers(users.filter((user) => user.id !== userId));
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error deleting user:", errorMessage);
      return false;
    }
  };

  // Email validation function stub - to be implemented by candidate
  const isValidEmail = (email: string): boolean => {
    // Implement email validation to check if it ends with '.com'
    return email.endsWith(".com");
  };

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold mb-4">Users</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Age</th>
              <th className="py-2 px-4 border-b">Email Valid</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center">
                  No users found. Upload CSV to get started!
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="py-2 px-4 border-b">{user.id}</td>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.age || "N/A"}</td>
                  <td className="py-2 px-4 border-b">
                    {isValidEmail(user.email) ? (
                      <span className="text-green-500">Valid</span>
                    ) : (
                      <span className="text-red-500">Invalid</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
