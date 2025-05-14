import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    status: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [sortField, sortDirection, filters]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we would fetch notes from API
      /*
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      params.append('sort_field', sortField);
      params.append('sort_direction', sortDirection);
      
      const response = await axios.get(`${API_URL}/api/notes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotes(response.data);
      */
      
      // Mock data
      setTimeout(() => {
        const mockNotes = [
          {
            _id: '1',
            created_at: '2023-11-15T10:30:00Z',
            patient_id: 'P12345',
            status: 'draft',
            subjective: 'Patient presents with chest pain that started yesterday. Pain is described as pressure-like, radiating to the left arm.',
            assessment: '1. Acute chest pain\n2. Hypertension',
            plan: 'ECG, cardiac enzymes, chest X-ray'
          },
          {
            _id: '2',
            created_at: '2023-11-14T14:15:00Z',
            patient_id: 'P67890',
            status: 'finalized',
            subjective: 'Follow-up for diabetes management. Patient reports improved blood sugar levels with current medication regimen.',
            assessment: '1. Type 2 diabetes, well-controlled\n2. Obesity',
            plan: 'Continue current medications, lifestyle modifications'
          },
          {
            _id: '3',
            created_at: '2023-11-13T09:45:00Z',
            patient_id: 'P54321',
            status: 'draft',
            subjective: 'Complaints of headache for 3 days. Pain is described as throbbing, predominantly in the frontal region.',
            assessment: '1. Tension headache\n2. Stress-related symptoms',
            plan: 'OTC analgesics, stress management techniques'
          },
          {
            _id: '4',
            created_at: '2023-11-12T11:20:00Z',
            patient_id: 'P24680',
            status: 'finalized',
            subjective: 'Annual physical examination. No specific complaints. Patient exercises regularly and maintains a healthy diet.',
            assessment: '1. Healthy adult\n2. Preventive care',
            plan: 'Routine laboratory tests, continue healthy lifestyle'
          },
          {
            _id: '5',
            created_at: '2023-11-11T15:40:00Z',
            patient_id: 'P13579',
            status: 'draft',
            subjective: 'Sore throat and cough for 5 days. Low-grade fever. No shortness of breath.',
            assessment: '1. Acute pharyngitis, likely viral\n2. Upper respiratory infection',
            plan: 'Symptomatic treatment, rest, hydration'
          }
        ];
        
        // Apply filters
        let filtered = [...mockNotes];
        
        if (filters.status) {
          filtered = filtered.filter(note => note.status === filters.status);
        }
        
        if (filters.date) {
          const today = new Date();
          const filterDate = new Date(today);
          
          if (filters.date === 'today') {
            filterDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(note => new Date(note.created_at) >= filterDate);
          } else if (filters.date === 'week') {
            filterDate.setDate(today.getDate() - 7);
            filtered = filtered.filter(note => new Date(note.created_at) >= filterDate);
          } else if (filters.date === 'month') {
            filterDate.setMonth(today.getMonth() - 1);
            filtered = filtered.filter(note => new Date(note.created_at) >= filterDate);
          }
        }
        
        // Apply search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(note => 
            note.patient_id.toLowerCase().includes(term) || 
            note.subjective.toLowerCase().includes(term) || 
            note.assessment.toLowerCase().includes(term) ||
            note.plan.toLowerCase().includes(term)
          );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
          if (sortField === 'created_at') {
            return sortDirection === 'asc' 
              ? new Date(a.created_at) - new Date(b.created_at)
              : new Date(b.created_at) - new Date(a.created_at);
          } else if (sortField === 'patient_id') {
            return sortDirection === 'asc'
              ? a.patient_id.localeCompare(b.patient_id)
              : b.patient_id.localeCompare(a.patient_id);
          } else if (sortField === 'status') {
            return sortDirection === 'asc'
              ? a.status.localeCompare(b.status)
              : b.status.localeCompare(a.status);
          }
          return 0;
        });
        
        setNotes(filtered);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const clearFilters = () => {
    setFilters({ status: '', date: '' });
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getSortIcon = (field) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4 ml-1" /> 
      : <ArrowDownIcon className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="pb-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Clinical Notes</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all your clinical documentation
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/transcribe"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <MicrophoneIcon className="h-5 w-5 mr-2" />
              New Transcription
            </Link>
          </div>
        </div>
      </header>
      
      <div className="mt-6">
        {/* Search and filter */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <form 
            className="flex-1 flex rounded-md shadow-sm"
            onSubmit={handleSearch}
          >
            <div className="relative flex-grow focus-within:z-10">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                placeholder="Search notes by patient ID or content"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Search
            </button>
          </form>
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => setShowFilters(!showFilters)}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-500" aria-hidden="true" />
            Filters
          </button>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  name="status"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="finalized">Finalized</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <select
                  id="date-filter"
                  name="date"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                >
                  <option value="">All time</option>
                  <option value="today">Today</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Notes list */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {loading ? (
                  <div className="bg-white px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-600">Loading notes...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="bg-white px-4 py-16 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || Object.values(filters).some(f => f) 
                        ? 'Try adjusting your search or filters' 
                        : 'Get started by creating a new transcription'}
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/transcribe"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <MicrophoneIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        New Transcription
                      </Link>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          scope="col" 
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                          onClick={() => handleSort('patient_id')}
                        >
                          <div className="flex items-center">
                            Patient ID
                            {getSortIcon('patient_id')}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center">
                            Date
                            {getSortIcon('created_at')}
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Content
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {getSortIcon('status')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {notes.map((note) => (
                        <tr key={note._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-600 sm:pl-6">
                            <Link to={`/notes/${note._id}`}>
                              {note.patient_id}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div>{formatDate(note.created_at)}</div>
                            <div className="text-xs">{formatTime(note.created_at)}</div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="line-clamp-2">{note.subjective}</div>
                            <div className="mt-1 line-clamp-1 text-xs font-medium text-gray-700">
                              Assessment: {note.assessment.split('\n')[0]}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${note.status === 'draft' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'}`}
                            >
                              {note.status === 'draft' ? 'Draft' : 'Finalized'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes; 