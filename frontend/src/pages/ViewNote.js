import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ViewNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    status: 'draft'
  });
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchNote();
  }, [id]);

  useEffect(() => {
    if (note) {
      setFormData({
        subjective: note.subjective || '',
        objective: note.objective || '',
        assessment: note.assessment || '',
        plan: note.plan || '',
        status: note.status || 'draft'
      });
      
      if (note.analysis) {
        setAnalysis(note.analysis);
      }
    }
  }, [note]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we would fetch from API
      /*
      const response = await axios.get(`${API_URL}/api/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNote(response.data);
      */
      
      // Mock data
      setTimeout(() => {
        const mockNote = {
          _id: id,
          created_at: '2023-11-15T10:30:00Z',
          updated_at: '2023-11-15T11:45:00Z',
          patient_id: 'P12345',
          status: 'draft',
          subjective: 'Patient is a 45-year-old male with a history of hypertension and type 2 diabetes presenting with chest pain that started yesterday. Patient describes the pain as pressure-like, radiating to the left arm, and associated with shortness of breath. Pain rated as 7/10. No prior history of cardiac issues. Currently taking lisinopril and metformin.',
          objective: 'Vital Signs: BP 150/90, HR 92, RR 18, Temp 98.6F, SpO2 97% on room air\nGeneral: Alert, anxious-appearing male in mild distress\nHEENT: Normocephalic, atraumatic. Mucous membranes moist.\nCardiovascular: Regular rate and rhythm. No murmurs, gallops, or rubs. PMI normal.\nRespiratory: Clear to auscultation bilaterally. No wheezes or crackles.\nAbdomen: Soft, non-tender, non-distended.\nExtremities: No edema. Normal peripheral pulses.',
          assessment: '1. Acute chest pain, concerning for possible acute coronary syndrome\n2. Hypertension, poorly controlled\n3. Type 2 diabetes mellitus',
          plan: '1. Obtain ECG and cardiac enzymes immediately\n2. Chest X-ray to rule out other causes\n3. Administer aspirin 325mg PO now\n4. Start nitroglycerin 0.4mg SL PRN chest pain\n5. Cardiology consultation\n6. Adjust hypertension medication: increase lisinopril to 20mg daily\n7. Continue current diabetes management\n8. Admit for observation and further cardiac workup',
          tags: ['cardiology', 'chest pain', 'hypertension', 'diabetes'],
          specialty: 'PRIMARY_CARE',
          confidence_score: 0.89,
          analysis: {
            medical_concepts: ['chest pain', 'hypertension', 'diabetes mellitus type 2', 'shortness of breath', 'acute coronary syndrome'],
            medications: ['lisinopril', 'metformin', 'aspirin', 'nitroglycerin'],
            diagnoses: ['acute chest pain', 'hypertension', 'diabetes mellitus type 2', 'possible acute coronary syndrome'],
            procedures: ['ECG', 'cardiac enzymes', 'chest X-ray']
          }
        };
        
        setNote(mockNote);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error('Failed to load note');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // In a real implementation, we would save to API
      /*
      const response = await axios.post(
        `${API_URL}/api/notes/save`,
        {
          id: note._id,
          ...formData
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setNote(response.data);
      */
      
      // Mock saving
      setTimeout(() => {
        const updatedNote = {
          ...note,
          ...formData,
          updated_at: new Date().toISOString()
        };
        
        setNote(updatedNote);
        setSaving(false);
        setEditing(false);
        toast.success('Note saved successfully');
      }, 1000);
      
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-600">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/notes')}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Patient {note.patient_id}
          </h1>
          <span
            className={`ml-4 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full
              ${note.status === 'draft' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'}`}
          >
            {note.status === 'draft' ? 'Draft' : 'Finalized'}
          </span>
        </div>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          {editing ? (
            <>
              <button
                type="button"
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setEditing(true)}
            >
              <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Edit Note
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        {/* Main content - SOAP */}
        <div className="sm:col-span-4">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">SOAP Note</h3>
              {editing && (
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-500">Status:</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className={`px-3 py-1 text-xs rounded-full ${
                        formData.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handleStatusChange('draft')}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 text-xs rounded-full ${
                        formData.status === 'finalized'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handleStatusChange('finalized')}
                    >
                      Finalized
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                {/* Subjective */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-12 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 sm:col-span-2 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-primary-500" />
                    Subjective
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-10">
                    {editing ? (
                      <textarea
                        name="subjective"
                        rows={5}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.subjective}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="whitespace-pre-line">{note.subjective}</p>
                    )}
                  </dd>
                </div>
                
                {/* Objective */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-12 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 sm:col-span-2 flex items-center">
                    <BeakerIcon className="h-5 w-5 mr-2 text-primary-500" />
                    Objective
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-10">
                    {editing ? (
                      <textarea
                        name="objective"
                        rows={5}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.objective}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="whitespace-pre-line">{note.objective}</p>
                    )}
                  </dd>
                </div>
                
                {/* Assessment */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-12 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 sm:col-span-2 flex items-center">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-primary-500" />
                    Assessment
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-10">
                    {editing ? (
                      <textarea
                        name="assessment"
                        rows={4}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.assessment}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="whitespace-pre-line">{note.assessment}</p>
                    )}
                  </dd>
                </div>
                
                {/* Plan */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-12 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 sm:col-span-2 flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-primary-500" />
                    Plan
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-10">
                    {editing ? (
                      <textarea
                        name="plan"
                        rows={5}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.plan}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="whitespace-pre-line">{note.plan}</p>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* AI Analysis */}
          {analysis && !editing && (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">AI Analysis</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Generated insights from the clinical note
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Medical Concepts
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {analysis.medical_concepts.map((concept, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Medications
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {analysis.medications.map((med, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {med}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Diagnoses
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {analysis.diagnoses.map((diagnosis, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {diagnosis}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Procedures
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {analysis.procedures.length > 0 ? (
                          analysis.procedures.map((procedure, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {procedure}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No procedures identified</span>
                        )}
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="sm:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Note Details</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <span>Created:</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(note.created_at)} at {formatTime(note.created_at)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <span>Last updated:</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(note.updated_at)} at {formatTime(note.updated_at)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-500">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <span>Specialty:</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {note.specialty?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
                {note.confidence_score && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <span>AI confidence:</span>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            note.confidence_score > 0.8 ? 'bg-green-600' : 
                            note.confidence_score > 0.6 ? 'bg-yellow-400' : 'bg-red-600'
                          }`} 
                          style={{ width: `${note.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 mt-1 inline-block">
                        {Math.round(note.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <TagIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <span>Tags:</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {note.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Warning for drafts */}
          {note.status === 'draft' && (
            <div className="mt-6 rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Draft Note</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This note is still in draft mode. Review the content carefully before finalizing it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNote; 