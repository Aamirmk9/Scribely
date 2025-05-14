import React, { useState, useEffect } from 'react';
import { UserIcon, KeyIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialty: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        specialty: currentUser.specialty || ''
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      setProfileUpdateSuccess(false);
      
      // In a real implementation, we would update via API
      /*
      const response = await axios.put(
        `${API_URL}/api/users/${currentUser.id}`,
        {
          full_name: formData.full_name,
          specialty: formData.specialty
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      */
      
      // Mock update
      setTimeout(() => {
        setProfileUpdateSuccess(true);
        toast.success('Profile updated successfully');
        setIsUpdating(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      setPasswordUpdateSuccess(false);
      
      // In a real implementation, we would update via API
      /*
      const response = await axios.put(
        `${API_URL}/api/users/${currentUser.id}`,
        {
          current_password: formData.currentPassword,
          password: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      */
      
      // Mock update
      setTimeout(() => {
        setPasswordUpdateSuccess(true);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
        toast.success('Password changed successfully');
        setIsChangingPassword(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-primary-500" />
            <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="full_name"
                      id="full_name"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                      value={formData.email}
                      readOnly
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                </div>

                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                    Specialty
                  </label>
                  <div className="mt-1">
                    <select
                      id="specialty"
                      name="specialty"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formData.specialty}
                      onChange={handleInputChange}
                    >
                      <option value="">No specialty</option>
                      <option value="PRIMARY_CARE">Primary Care</option>
                      <option value="CARDIOLOGY">Cardiology</option>
                      <option value="NEUROLOGY">Neurology</option>
                      <option value="ONCOLOGY">Oncology</option>
                      <option value="RADIOLOGY">Radiology</option>
                      <option value="UROLOGY">Urology</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {profileUpdateSuccess && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckIcon className="h-5 w-5 mr-1 text-green-500" />
                      Profile updated successfully
                    </div>
                  )}
                  <button
                    type="submit"
                    className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <KeyIcon className="h-5 w-5 mr-2 text-primary-500" />
            <h3 className="text-lg font-medium leading-6 text-gray-900">Password</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleChangePassword}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="confirmNewPassword"
                      id="confirmNewPassword"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {formData.newPassword && formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {passwordUpdateSuccess && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckIcon className="h-5 w-5 mr-1 text-green-500" />
                      Password changed successfully
                    </div>
                  )}
                  <button
                    type="submit"
                    className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={isChangingPassword || (formData.newPassword !== formData.confirmNewPassword)}
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

 