import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DatasetBrowser from './components/DatasetBrowser';
import DatasetVisualization from './components/DatasetVisualization';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 safe-area">
        <Routes>
          <Route path="/" element={<DatasetBrowser />} />
          <Route path="/dataset/:datasetId" element={<DatasetVisualization />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
