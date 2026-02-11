'use client';
import { useState } from 'react';
import type { UserPreferences, IncomeFrequency } from '@/lib/types';

interface PreferencesPanelProps {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}

export default function PreferencesPanel({ preferences, onUpdate }: PreferencesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFrequencyChange = (frequency: IncomeFrequency) => {
    onUpdate({ ...preferences, incomeFrequency: frequency });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="font-semibold">Preferences</h3>
          <p className="text-sm text-gray-600">
            Income Frequency: {preferences.incomeFrequency === 'weekly' ? 'Weekly' : 'Monthly'}
          </p>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Income Frequency</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleFrequencyChange('weekly')}
                className={`flex-1 px-4 py-2 rounded border transition-colors ${
                  preferences.incomeFrequency === 'weekly'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => handleFrequencyChange('monthly')}
                className={`flex-1 px-4 py-2 rounded border transition-colors ${
                  preferences.incomeFrequency === 'monthly'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                Monthly
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {preferences.incomeFrequency === 'weekly'
                ? 'Income will be calculated and displayed on a weekly basis'
                : 'Income will be calculated and displayed on a monthly basis'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
