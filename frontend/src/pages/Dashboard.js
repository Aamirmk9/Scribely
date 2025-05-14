import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClockIcon, 
  DocumentTextIcon, 
  MicrophoneIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentNotes, setRecentNotes] = useState([]);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalTranscriptions: 0,
    timeSaved: 0
  });

  // Mock data for the chart
  const chartData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Notes Created',
        data: [4, 6, 2, 8, 5, 1, 0],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
      {
        label: 'Transcriptions',
        data: [5, 8, 3, 10, 6, 2, 0],
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Activity',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would fetch this data from your API
        // For now, we'll use mock data
        
        // Mock fetch recent notes
        /*
        const notesResponse = await axios.get(`${API_URL}/api/notes?limit=5`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRecentNotes(notesResponse.data);
        */
        
        // Mock data
        setRecentNotes([
          {
            _id: '1',
            created_at: '2023-11-15T10:30:00Z',
            patient_id: 'P12345',
            status: 'draft',
            subjective: 'Patient presents with chest pain...',
            assessment: '1. Acute chest pain\n2. Hypertension'
          },
          {
            _id: '2',
            created_at: '2023-11-14T14:15:00Z',
            patient_id: 'P67890',
            status: 'finalized',
            subjective: 'Follow-up for diabetes management...',
            assessment: '1. Type 2 diabetes\n2. Obesity'
          },
          {
            _id: '3',
            created_at: '2023-11-13T09:45:00Z',
            patient_id: 'P54321',
            status: 'draft',
            subjective: 'Complaints of headache for 3 days...',
            assessment: '1. Tension headache\n2. Stress-related symptoms'
          }
        ]);
        
        // Mock stats
        setStats({
          totalNotes: 42,
          totalTranscriptions: 56,
          timeSaved: 31.5 // hours
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <header className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {currentUser?.full_name || 'User'}
          </p>
        </div>
      </header>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner">Loading...</div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto pb-12">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <DocumentTextIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Notes</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.totalNotes}</div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                    <MicrophoneIcon className="h-6 w-6 text-secondary-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Transcriptions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.totalTranscriptions}</div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-accent-100 rounded-md p-3">
                    <ClockIcon className="h-6 w-6 text-accent-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Time Saved</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.timeSaved} hrs</div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900">Activity</h2>
              </div>
              <div className="h-80">
                <Bar options={chartOptions} data={chartData} height="100%" />
              </div>
            </div>
            
            {/* Recent Notes */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Notes</h2>
                  <Link 
                    to="/notes"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
                  >
                    View all
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <li key={note._id}>
                      <Link to={`/notes/${note._id}`} className="block hover:bg-gray-50">
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              Patient {note.patient_id}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${note.status === 'draft' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'}`}
                              >
                                {note.status === 'draft' ? 'Draft' : 'Finalized'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 line-clamp-1">{note.subjective}</p>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">{formatDate(note.created_at)}</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-4 text-center text-sm text-gray-500">
                    No notes yet. Start by creating a transcription.
                  </li>
                )}
              </ul>
              <div className="px-6 py-4 border-t border-gray-200">
                <Link
                  to="/transcribe"
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <MicrophoneIcon className="mr-2 h-5 w-5" />
                  New Transcription
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 