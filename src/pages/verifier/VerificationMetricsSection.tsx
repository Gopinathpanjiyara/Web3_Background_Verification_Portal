import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define types for our metrics data
interface VerificationMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

interface VerificationMetricsSectionProps {
  metrics: VerificationMetric[];
  timeRange: 'day' | 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'year') => void;
  documentVerificationsChart: ChartData;
  documentTypeDistribution: ChartData;
  loading: boolean;
}

const VerificationMetricsSection: React.FC<VerificationMetricsSectionProps> = ({
  metrics,
  timeRange,
  onTimeRangeChange,
  documentVerificationsChart,
  documentTypeDistribution,
  loading
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  // Placeholder for chart components
  // In a real implementation, you would use a library like Chart.js or Recharts
  // and pass in the chart data from props
  const renderLineChart = () => (
    <div className="bg-dark-800 rounded-lg p-4 h-64 flex items-center justify-center">
      <div className="text-gray-400 text-sm">
        Line Chart Placeholder - Document Verifications Over Time
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="bg-dark-800 rounded-lg p-4 h-64 flex items-center justify-center">
      <div className="text-gray-400 text-sm">
        Pie Chart Placeholder - Document Type Distribution
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold">Verification Metrics</h2>
            <p className="text-gray-400 text-sm mt-1">
              Track and analyze your document verification activities
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? "bg-primary-500 text-white"
                  : "bg-dark-800 text-gray-300 hover:bg-dark-600"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? "bg-primary-500 text-white"
                  : "bg-dark-800 text-gray-300 hover:bg-dark-600"
              }`}
            >
              Details
            </button>
            
            <div className="border-l border-dark-600 ml-2 pl-2"></div>
            
            <div className="bg-dark-800 rounded-lg p-1 flex">
              {(['day', 'week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    timeRange === range
                      ? "bg-dark-600 text-white"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {activeTab === 'overview' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {metrics.map((metric) => (
                <div key={metric.id} className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-dark-700 rounded-lg">
                      {metric.icon}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    <div className={`text-xs font-medium flex items-center
                      ${metric.changeType === 'increase' ? 'text-green-400' : ''}
                      ${metric.changeType === 'decrease' ? 'text-red-400' : ''}
                      ${metric.changeType === 'neutral' ? 'text-gray-400' : ''}
                    `}>
                      {metric.changeType === 'increase' && (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                      {metric.changeType === 'decrease' && (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                      {metric.change}%
                    </div>
                    <span className="text-xs text-gray-500 ml-2">vs previous {timeRange}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Verification Activity</h3>
                {renderLineChart()}
                <div className="text-xs text-gray-500 text-center mt-2">
                  Document verifications over the past {timeRange}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Document Types</h3>
                {renderPieChart()}
                <div className="text-xs text-gray-500 text-center mt-2">
                  Distribution of verified document types
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-dark-800 rounded-xl">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Top Verifiers</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-dark-600 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">Verifier {item}</p>
                          <p className="text-xs text-gray-500">128 documents</p>
                        </div>
                      </div>
                      <div className="text-xs text-primary-400">
                        +12%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-dark-800 rounded-xl">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Popular Document Types</h4>
                <div className="space-y-3">
                  {['Academic Certificate', 'Government ID', 'Professional License'].map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                      <div>
                        <p className="font-medium">{type}</p>
                        <div className="w-full bg-dark-600 h-1.5 rounded-full mt-2">
                          <div 
                            className="bg-primary-500 h-1.5 rounded-full" 
                            style={{ width: `${90 - index * 20}%` }} 
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium ml-4">
                        {90 - index * 20}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-dark-800 rounded-xl">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Blockchain Records</h4>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm">Verified on Blockchain</p>
                  <p className="text-xl font-bold">38%</p>
                </div>
                <div className="w-full bg-dark-700 h-3 rounded-full">
                  <div className="bg-primary-500 h-3 rounded-full" style={{ width: '38%' }} />
                </div>
                <div className="mt-4 space-y-2">
                  {['Ethereum', 'Polygon', 'Solana'].map((chain, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <p className="text-sm text-gray-400">{chain}</p>
                      <p className="text-sm font-medium">{20 - index * 5}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-dark-800 rounded-xl">
              <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Recent Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-3">
                  <div className="bg-dark-700 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-sm text-gray-400">Weekly Verification Volume Chart Placeholder</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Average Time</p>
                    <p className="font-medium">5.2 minutes</p>
                    <p className="text-xs text-green-400 mt-1">-12% vs last {timeRange}</p>
                  </div>
                  
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Verification Rate</p>
                    <p className="font-medium">98.6%</p>
                    <p className="text-xs text-green-400 mt-1">+1.2% vs last {timeRange}</p>
                  </div>
                  
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Rejection Rate</p>
                    <p className="font-medium">1.4%</p>
                    <p className="text-xs text-red-400 mt-1">+0.3% vs last {timeRange}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerificationMetricsSection; 