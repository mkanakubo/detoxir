'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setName('');
        setEmail('');
      } else {
        console.error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen p-8 font-sans">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Detoxir Full-Stack Demo
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add User
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Users</h2>
              <button
                onClick={fetchUsers}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <p className="text-gray-500">No users found</p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 bg-gray-50 rounded-md border"
                    >
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                      <p className="text-gray-400 text-xs">ID: {user.id}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Architecture Flow:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li><strong>Frontend (Next.js)</strong> → HTTP request to API route</li>
            <li><strong>API Route (/api/users)</strong> → GraphQL query to backend</li>
            <li><strong>Backend (NestJS)</strong> → GraphQL resolver processes request</li>
            <li><strong>GraphQL Response</strong> → Back to API route</li>
            <li><strong>HTTP Response</strong> → Back to frontend</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
