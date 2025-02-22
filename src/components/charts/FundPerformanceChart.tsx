'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import TextTransition, { presets } from 'react-text-transition';
import { GlassCard } from '../ui/GlassCard';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Chart options
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#00ff99',
      bodyColor: '#fff',
      borderColor: '#00ff99',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#fff',
      },
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#fff',
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
};

// Sample data - replace with real data from your API
const generateSampleData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseValue = 1000;
  const data = months.map(() => baseValue + Math.random() * 500);
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Fund Value',
        data: data,
        borderColor: '#00ff99',
        backgroundColor: 'rgba(0, 255, 153, 0.5)',
        borderWidth: 2,
        pointBackgroundColor: '#00ff99',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00ff99',
        tension: 0.4,
        fill: true,
      },
    ],
  };
};

export function FundPerformanceChart() {
  const [chartData, setChartData] = useState(generateSampleData());
  const [currentValue, setCurrentValue] = useState('0');

  useEffect(() => {
    // Update current value when chart data changes
    const latestValue = chartData.datasets[0].data.slice(-1)[0];
    setCurrentValue(latestValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    }));

    // Simulate real-time updates
    const interval = setInterval(() => {
      setChartData(generateSampleData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="p-6 w-full h-[400px]">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Fund Performance</h2>
        <div className="text-2xl font-bold text-[#00ff99]">
          <TextTransition inline springConfig={presets.gentle}>
            {currentValue}
          </TextTransition>
        </div>
      </div>
      
      <div className="h-[300px] transform perspective-1000 rotate-x-5 rotate-y-[-5deg] transition-transform duration-300 hover:rotate-x-0 hover:rotate-y-0">
        <Line data={chartData} options={options} />
      </div>
    </GlassCard>
  );
}
