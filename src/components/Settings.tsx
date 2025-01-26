import React, { useState } from 'react';
import { Download, Upload, Plus, X } from 'lucide-react';
import { useTradeStore } from '../store/useTradeStore';

export function Settings() {
  const { 
    trades, 
    importTrades, 
    predefinedTags, 
    predefinedSetups, 
    addPredefinedTag, 
    removePredefinedTag, 
    addPredefinedSetup, 
    removePredefinedSetup,
    importPredefinedTags,
    importPredefinedSetups
  } = useTradeStore();
  const [newTag, setNewTag] = useState('');
  const [newSetup, setNewSetup] = useState('');

  const handleExport = () => {
    const exportData = {
      trades,
      predefinedTags,
      predefinedSetups
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'trading-journal-export.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Import trades
        if (Array.isArray(importedData.trades)) {
          importTrades(importedData.trades);
          
          // Extract unique tags and setups from imported trades
          const uniqueTags = new Set<string>();
          const uniqueSetups = new Set<string>();
          
          importedData.trades.forEach((trade: any) => {
            if (Array.isArray(trade.tags)) {
              trade.tags.forEach((tag: string) => uniqueTags.add(tag));
            }
            if (trade.setup) {
              uniqueSetups.add(trade.setup);
            }
          });
          
          // Import predefined tags and setups if they exist in the export file
          if (Array.isArray(importedData.predefinedTags)) {
            importedData.predefinedTags.forEach((tag: string) => uniqueTags.add(tag));
          }
          if (Array.isArray(importedData.predefinedSetups)) {
            importedData.predefinedSetups.forEach((setup: string) => uniqueSetups.add(setup));
          }
          
          // Update predefined tags and setups
          importPredefinedTags(Array.from(uniqueTags));
          importPredefinedSetups(Array.from(uniqueSetups));
        }
      } catch (error) {
        console.error('Error importing trades:', error);
        alert('Error importing trades. Please make sure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !predefinedTags.includes(newTag.trim())) {
      addPredefinedTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleAddSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSetup.trim() && !predefinedSetups.includes(newSetup.trim())) {
      addPredefinedSetup(newSetup.trim());
      setNewSetup('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Predefined Tags</h3>
          <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter new tag"
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {predefinedTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removePredefinedTag(tag)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Predefined Setups</h3>
          <form onSubmit={handleAddSetup} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSetup}
              onChange={(e) => setNewSetup(e.target.value)}
              placeholder="Enter new setup"
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {predefinedSetups.map((setup) => (
              <div
                key={setup}
                className="inline-flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full px-3 py-1"
              >
                <span>{setup}</span>
                <button
                  onClick={() => removePredefinedSetup(setup)}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Trades
            </button>
            <div>
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                <Upload className="h-5 w-5 mr-2" />
                Import Trades
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
