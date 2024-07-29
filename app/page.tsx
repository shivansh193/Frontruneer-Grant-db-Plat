'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [grants, setGrants] = useState([{ name: '' }]);
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState<File | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      setIsDarkMode(e.matches);
    });
  }, []);

  const addGrant = () => {
    setGrants([...grants, { name: '' }]);
  };

  const updateGrantName = (index: any, name: any) => {
    const newGrants = [...grants];
    newGrants[index].name = name;
    setGrants(newGrants);
  };

  const removeGrant = (index: any) => {
    const newGrants = grants.filter((_, i) => i !== index);
    setGrants(newGrants);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    grants.forEach((grant, index) => {
      formData.append(`grantName${index}`, grant.name);
    });
    formData.append('apiKey', apiKey);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch('/api/process-grant', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'updated_grants_data.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing the request.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFile(file);
  };
  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-24 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Grant Data Processor</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          {grants.map((grant, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={grant.name}
                onChange={(e) => updateGrantName(index, e.target.value)}
                placeholder="Grant Name"
                required
                className="flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {grants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGrant(index)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addGrant}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Add Grant
          </button>
          <div>
            <label htmlFor="apiKey" className="block mb-2 font-semibold">Gemini API Key:</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="file" className="block mb-2 font-semibold">Excel File:</label>
            <input
              type="file"
              id="file"
              accept=".xlsx"
              onChange={handleFileChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-200"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            {isLoading ? 'Processing...' : 'Process Grants'}
          </button>
        </form>
      </div>
    </main>
  );
}