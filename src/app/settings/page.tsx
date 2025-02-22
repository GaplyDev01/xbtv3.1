'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

interface Setting {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input';
  value: any;
  options?: string[];
}

const defaultSettings: Setting[] = [
  {
    id: 'notifications',
    label: 'Trading Notifications',
    description: 'Receive notifications for important trading events and signals',
    type: 'toggle',
    value: true,
  },
  {
    id: 'riskLevel',
    label: 'Risk Level',
    description: 'Set your preferred risk level for AI trading',
    type: 'select',
    value: 'medium',
    options: ['low', 'medium', 'high'],
  },
  {
    id: 'tradingLimit',
    label: 'Daily Trading Limit',
    description: 'Maximum amount that can be traded per day (in USDC)',
    type: 'input',
    value: '10000',
  },
  {
    id: 'autoTrade',
    label: 'Automated Trading',
    description: 'Allow AI to execute trades automatically',
    type: 'toggle',
    value: false,
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>(defaultSettings);

  const updateSetting = (id: string, newValue: any) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value: newValue } : setting
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#00ff99] to-[#00ccff] bg-clip-text text-transparent">
          Settings
        </h1>

        <div className="space-y-6">
          {settings.map((setting) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-white">{setting.label}</h3>
                    <p className="text-sm text-gray-400">{setting.description}</p>
                  </div>
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => updateSetting(setting.id, !setting.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.value ? 'bg-[#00ff99]' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>
                {setting.type === 'select' && (
                  <select
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.id, e.target.value)}
                    className="mt-2 w-full bg-gray-900/50 text-white p-2 rounded-lg border border-gray-800 focus:border-[#00ff99] focus:outline-none"
                  >
                    {setting.options?.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
                {setting.type === 'input' && (
                  <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => updateSetting(setting.id, e.target.value)}
                    className="mt-2 w-full bg-gray-900/50 text-white p-2 rounded-lg border border-gray-800 focus:border-[#00ff99] focus:outline-none"
                  />
                )}
              </GlassCard>
            </motion.div>
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-[#00ff99]/20 text-[#00ff99] rounded-lg border border-[#00ff99]/50 hover:bg-[#00ff99]/30 transition-colors mt-8"
          >
            Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );
}
