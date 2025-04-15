import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../utils/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    group: '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        group: user.group || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await apiService.updateProfile(profileData);
      
      setSuccess('Профиль сәтті жаңартылды');
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Профильді жаңарту мүмкін болмады. Кейінірек қайталап көріңіз.');
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Құпия сөздер сәйкес келмейді');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setPasswordError('Жаңа құпия сөз кемінде 8 таңбадан тұруы керек');
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);
      
      await apiService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      
      // Reset password fields
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      setPasswordSuccess('Құпия сөз сәтті өзгертілді');
      setPasswordLoading(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Құпия сөзді өзгерту мүмкін болмады. Ағымдағы құпия сөздің дұрыстығын тексеріңіз.');
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        <p className="mt-1 text-sm text-gray-500">
          Профиліңізді және тіркелгі параметрлерін басқару
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Профиль ақпараты
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Сіздің жеке деректеріңіз
          </p>
        </div>
        <div className="border-t border-gray-200">
          <form onSubmit={handleProfileSubmit} className="p-4 space-y-4">
            {error && (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Қате</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Сәтті</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Аты
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Тегі
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email өзгертуге болмайды
                </p>
              </div>
              {user?.role === 'student' && (
                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700">
                    Топ
                  </label>
                  <input
                    type="text"
                    name="group"
                    id="group"
                    value={profileData.group}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Сақталуда...
                  </>
                ) : (
                  'Өзгерістерді сақтау'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Құпия сөзді өзгерту
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Қауіпсіздік үшін құпия сөзіңізді жаңартыңыз
          </p>
        </div>
        <div className="border-t border-gray-200">
          <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
            {passwordError && (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Қате</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{passwordError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {passwordSuccess && (
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Сәтті</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{passwordSuccess}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">
                  Ағымдағы құпия сөз
                </label>
                <input
                  type="password"
                  name="old_password"
                  id="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                      Жаңа құпия сөз
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      id="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                      Құпия сөзді растау
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  passwordLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {passwordLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Өзгертілуде...
                  </>
                ) : (
                  'Құпия сөзді өзгерту'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Тіркелгі әрекеттері
          </h3>
        </div>
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Тіркелгіден шығу
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
