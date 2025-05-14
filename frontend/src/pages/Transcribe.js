import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MicrophoneIcon, 
  StopIcon, 
  PauseIcon, 
  ArrowUpTrayIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Transcribe = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState('idle'); // idle, processing, completed, error
  const [uploadingFile, setUploadingFile] = useState(false);
  const [specialty, setSpecialty] = useState('PRIMARY_CARE');
  const [jobId, setJobId] = useState(null);
  
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopRecording();
    };
  }, []);

  // Update timer while recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Poll for transcription results when a job is in progress
  useEffect(() => {
    let interval = null;
    
    if (jobId && transcriptionStatus === 'processing') {
      interval = setInterval(() => {
        checkTranscriptionStatus(jobId);
      }, 3000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [jobId, transcriptionStatus]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Reset state
      setRecordingTime(0);
      setTranscriptionText('');
      setTranscriptionStatus('idle');
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Collect audio chunks
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      
      // Start real-time transcription job
      try {
        const response = await axios.post(
          `${API_URL}/api/transcribe/start`,
          { specialty },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setJobId(response.data.job_id);
        setTranscriptionStatus('processing');
      } catch (error) {
        console.error('Error starting transcription:', error);
        toast.error('Failed to start transcription service');
      }
      
    } catch (err) {
      console.error('Error starting recording:', err);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (!isPaused) {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      } else {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      }
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Get all tracks from the stream and stop them
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // In a real implementation, you would upload this blob to your server
      // and then start the AWS Transcribe job
      
      // For demo purposes, we'll just check the existing job status
      if (jobId) {
        checkTranscriptionStatus(jobId);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit');
      return;
    }
    
    // Check file type
    if (!file.type.includes('audio')) {
      toast.error('Please upload an audio file');
      return;
    }
    
    try {
      setUploadingFile(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('audio_file', file);
      formData.append('specialty', specialty);
      
      // Upload file for transcription
      const response = await axios.post(
        `${API_URL}/api/transcribe/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setJobId(response.data.job_id);
      setTranscriptionStatus('processing');
      toast.info('Audio uploaded. Transcription in progress...');
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload and transcribe audio file');
    } finally {
      setUploadingFile(false);
    }
  };

  const checkTranscriptionStatus = async (jId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/transcribe/${jId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const { status, transcript } = response.data;
      
      if (status === 'completed') {
        setTranscriptionStatus('completed');
        setTranscriptionText(transcript);
        toast.success('Transcription completed!');
      } else if (status === 'failed') {
        setTranscriptionStatus('error');
        toast.error('Transcription failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setTranscriptionStatus('error');
    }
  };

  const handleGenerateNote = async () => {
    if (!jobId) {
      toast.error('No transcription available');
      return;
    }
    
    try {
      // Generate SOAP note from transcription
      const response = await axios.post(
        `${API_URL}/api/notes/generate`,
        {
          transcription_id: jobId,
          specialty
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Navigate to the note editor
      navigate(`/notes/${response.data._id}`);
      
    } catch (error) {
      console.error('Error generating note:', error);
      toast.error('Failed to generate clinical note');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Transcribe</h1>
        <p className="mt-1 text-sm text-gray-500">
          Record or upload audio for AI-powered medical transcription
        </p>
      </header>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Recorder controls */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recording Options</h2>
            
            {/* Specialty selector */}
            <div className="mb-6">
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Medical Specialty
              </label>
              <select
                id="specialty"
                name="specialty"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                disabled={isRecording || transcriptionStatus === 'processing' || uploadingFile}
              >
                <option value="PRIMARY_CARE">Primary Care</option>
                <option value="CARDIOLOGY">Cardiology</option>
                <option value="NEUROLOGY">Neurology</option>
                <option value="ONCOLOGY">Oncology</option>
                <option value="RADIOLOGY">Radiology</option>
                <option value="UROLOGY">Urology</option>
              </select>
            </div>
            
            {/* File upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Audio
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        disabled={isRecording || uploadingFile || transcriptionStatus === 'processing'}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">MP3, WAV, or FLAC up to 25MB</p>
                </div>
              </div>
              {uploadingFile && (
                <p className="mt-2 text-sm text-gray-500">Uploading and processing...</p>
              )}
            </div>
            
            {/* Recording controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Audio
              </label>
              
              <div className="mt-3 flex items-center space-x-4">
                {!isRecording ? (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={startRecording}
                    disabled={uploadingFile || transcriptionStatus === 'processing'}
                  >
                    <MicrophoneIcon className="h-5 w-5 mr-2" />
                    Start Recording
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      onClick={pauseRecording}
                    >
                      {isPaused ? (
                        <>
                          <MicrophoneIcon className="h-5 w-5 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <PauseIcon className="h-5 w-5 mr-2" />
                          Pause
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={stopRecording}
                    >
                      <StopIcon className="h-5 w-5 mr-2" />
                      Stop
                    </button>
                  </>
                )}
              </div>
              
              {isRecording && (
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${isPaused ? 'bg-amber-600' : 'bg-red-600 animate-pulse'} mr-2`}></div>
                    <span className="text-sm font-medium">
                      {isPaused ? 'Paused' : 'Recording'}: {formatTime(recordingTime)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {isPaused 
                      ? 'Recording paused. Press resume to continue.'
                      : 'Speak clearly into your microphone...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Transcription result */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Transcription</h3>
              <div className="flex items-center">
                <span 
                  className={`inline-flex h-2.5 w-2.5 rounded-full mr-2 
                    ${transcriptionStatus === 'idle' ? 'bg-gray-400' : 
                      transcriptionStatus === 'processing' ? 'bg-amber-500 animate-pulse' : 
                      transcriptionStatus === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}
                ></span>
                <span className="text-sm text-gray-500">
                  {transcriptionStatus === 'idle' ? 'Ready' : 
                   transcriptionStatus === 'processing' ? 'Processing' : 
                   transcriptionStatus === 'completed' ? 'Completed' : 'Error'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              {transcriptionStatus === 'idle' ? (
                <div className="text-center py-10">
                  <MicrophoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transcription</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start recording or upload an audio file to begin.
                  </p>
                </div>
              ) : transcriptionStatus === 'processing' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-sm text-gray-600">Transcribing audio...</p>
                </div>
              ) : transcriptionStatus === 'error' ? (
                <div className="text-center py-10">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Transcription failed</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please try again or contact support if the issue persists.
                  </p>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p>{transcriptionText}</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenerateNote}
                disabled={transcriptionStatus !== 'completed'}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Generate SOAP Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transcribe; 