import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'student',
    group: '',
  });
  const [errors, setErrors] = useState({});
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email міндетті';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email форматы дұрыс емес';
    }
    if (!formData.password) {
      newErrors.password = 'Құпия сөз міндетті';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Құпия сөз кемінде 8 таңбадан тұруы керек';
    }
    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Құпия сөздер сәйкес келмейді';
    }
    if (!formData.first_name) {
      newErrors.first_name = 'Атыңыз міндетті';
    }
    if (!formData.last_name) {
      newErrors.last_name = 'Тегіңіз міндетті';
    }
    if (formData.role === 'student' && !formData.group) {
      newErrors.group = 'Студенттер үшін топ міндетті';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const success = await register(formData);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Тіркелу
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Зертханалық жұмыстарды тексеру жүйесінде тіркелгі жасаңыз
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="first_name" className="sr-only">
                Аты
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Аты"
                value={formData.first_name}
                onChange={handleChange}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="sr-only">
                Тегі
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Тегі"
                value={formData.last_name}
                onChange={handleChange}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Рөлі
              </label>
              <select
                id="role"
                name="role"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Студент</option>
                <option value="teacher">Оқытушы</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
            {formData.role === 'student' && (
              <div>
                <label htmlFor="group" className="sr-only">
                  Топ
                </label>
                <input
                  id="group"
                  name="group"
                  type="text"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.group ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Топ (мысалы, АЖ-31)"
                  value={formData.group}
                  onChange={handleChange}
                />
                {errors.group && (
                  <p className="mt-1 text-sm text-red-600">{errors.group}</p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="password" className="sr-only">
                Құпия сөз
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Құпия сөз"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="password2" className="sr-only">
                Құпия сөзді растау
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password2 ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Құпия сөзді растау"
                value={formData.password2}
                onChange={handleChange}
              />
              {errors.password2 && (
                <p className="mt-1 text-sm text-red-600">{errors.password2}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Тіркелу қатесі
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                </span>
              ) : null}
              Тіркелу
            </button>
          </div>

          <div className="text-sm text-center">
            <p>
              Тіркелгіңіз бар ма?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Кіру
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
