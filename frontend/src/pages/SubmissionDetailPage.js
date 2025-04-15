import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../utils/api';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeViewer = ({ fileUrl, fileExtension, comments = [] }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        setLoading(true);
        const response = await fetch(fileUrl);
        const text = await response.text();
        setCode(text);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching code:', error);
        setError('Кодты жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.');
        setLoading(false);
      }
    };

    if (fileUrl) {
      fetchCode();
    }
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  // Determine language based on file extension
  let language = 'text';
  if (fileExtension === '.py') language = 'python';
  else if (fileExtension === '.cpp' || fileExtension === '.c' || fileExtension === '.h') language = 'cpp';
  else if (fileExtension === '.js') language = 'javascript';
  else if (fileExtension === '.html') language = 'html';
  else if (fileExtension === '.css') language = 'css';

  // Split code into lines for line numbers and comments
  const codeLines = code.split('\n');

  return (
    <div className="code-editor">
      {codeLines.map((line, index) => {
        const lineNumber = index + 1;
        const lineComments = comments.filter(comment => comment.line_number === lineNumber);
        const hasComment = lineComments.length > 0;

        return (
          <div key={lineNumber} className="code-line">
            <div className="line-number">{lineNumber}</div>
            <div className={`line-content ${hasComment ? 'highlighted' : ''}`}>
              <SyntaxHighlighter
                language={language}
                style={docco}
                customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                wrapLines={true}
              >
                {line || ' '}
              </SyntaxHighlighter>
              {hasComment && (
                <div className="mt-1 mb-2 ml-4 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                  {lineComments.map((comment, i) => (
                    <div key={i} className="mb-1 last:mb-0">
                      <span className="font-medium">{comment.teacher_name}:</span> {comment.comment}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TeacherReviewForm = ({ submissionId, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    comments: '',
    grade: '',
  });
  const [errors, setErrors] = useState({});

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
    if (!formData.comments) {
      newErrors.comments = 'Пікір міндетті';
    }
    if (formData.grade && (isNaN(formData.grade) || formData.grade < 0 || formData.grade > 100)) {
      newErrors.grade = 'Баға 0-ден 100-ге дейінгі сан болуы керек';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Жұмысты тексеру
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Студентке пікір мен баға қосыңыз
        </p>
      </div>
      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Пікір
            </label>
            <textarea
              name="comments"
              id="comments"
              rows={4}
              value={formData.comments}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                errors.comments ? 'border-red-300' : ''
              }`}
              placeholder="Студенттің жұмысына сіздің пікіріңіз..."
            />
            {errors.comments && (
              <p className="mt-1 text-sm text-red-600">{errors.comments}</p>
            )}
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
              Баға (0-100)
            </label>
            <input
              type="number"
              name="grade"
              id="grade"
              min="0"
              max="100"
              value={formData.grade}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                errors.grade ? 'border-red-300' : ''
              }`}
              placeholder="Баға (0-100)"
            />
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Болдырмау
            </button>
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
                'Тексеруді сақтау'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CodeCommentForm = ({ submissionId, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    line_number: '',
    comment: '',
  });
  const [errors, setErrors] = useState({});

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
    if (!formData.line_number) {
      newErrors.line_number = 'Жол нөмірі міндетті';
    } else if (isNaN(formData.line_number) || formData.line_number < 1) {
      newErrors.line_number = 'Жол нөмірі оң сан болуы керек';
    }
    if (!formData.comment) {
      newErrors.comment = 'Пікір міндетті';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form after submission
      setFormData({
        line_number: '',
        comment: '',
      });
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Кодқа пікір қосу
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Жол нөмірін және пікірді көрсетіңіз
        </p>
      </div>
      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <div className="sm:col-span-1">
              <label htmlFor="line_number" className="block text-sm font-medium text-gray-700">
                Жол
              </label>
              <input
                type="number"
                name="line_number"
                id="line_number"
                min="1"
                value={formData.line_number}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.line_number ? 'border-red-300' : ''
                }`}
                placeholder="№"
              />
              {errors.line_number && (
                <p className="mt-1 text-sm text-red-600">{errors.line_number}</p>
              )}
            </div>
            <div className="sm:col-span-5">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Пікір
              </label>
              <input
                type="text"
                name="comment"
                id="comment"
                value={formData.comment}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  errors.comment ? 'border-red-300' : ''
                }`}
                placeholder="Осы код жолына сіздің пікіріңіз..."
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
              )}
            </div>
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
                  Қосылуда...
                </>
              ) : (
                'Пікір қосу'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubmissionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [codeComments, setCodeComments] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch submission details
        const submissionResponse = await apiService.getSubmission(id);
        setSubmission(submissionResponse.data);

        // Check if verification is needed
        setShowVerifyButton(
          submissionResponse.data.status === 'pending' &&
          (user?.role === 'teacher' || user?.role === 'admin')
        );

        // Fetch code comments
        if (submissionResponse.data.code_comments) {
          setCodeComments(submissionResponse.data.code_comments);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching submission data:', error);
        setError('Жұмыс деректерін жүктеу мүмкін болмады. Өтінеміз, кейінірек қайталап көріңіз.');
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [id, user]);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setError(null);
      
      // Имитация процесса проверки с задержкой
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await apiService.verifySubmission(id);
      
      // Update submission with verification results
      setSubmission(prev => ({
        ...prev,
        status: 'verified',
        verification_result: response.data,
      }));
      
      setShowVerifyButton(false);
      setVerifying(false);
    } catch (error) {
      console.error('Error verifying submission:', error);
      setError('Автоматты тексеруді орындау мүмкін болмады. Кейінірек қайталап көріңіз.');
      setVerifying(false);
    }
  };

  const handleReview = async (reviewData) => {
    try {
      setReviewing(true);
      setError(null);
      const response = await apiService.reviewSubmission(id, reviewData);
      
      // Update submission with review
      setSubmission(prev => ({
        ...prev,
        status: 'reviewed',
        teacher_review: response.data,
      }));
      
      setShowReviewForm(false);
      setReviewing(false);
    } catch (error) {
      console.error('Error reviewing submission:', error);
      setError('Тексеруді сақтау мүмкін болмады. Өтінеміз, кейінірек қайталап көріңіз.');
      setReviewing(false);
    }
  };

  const handleAddCodeComment = async (commentData) => {
    try {
      setCommenting(true);
      setError(null);
      const response = await apiService.addCodeComment(id, commentData);
      
      // Add new comment to the list
      setCodeComments(prev => [...prev, response.data]);
      
      setCommenting(false);
    } catch (error) {
      console.error('Error adding code comment:', error);
      setError('Пікір қосу мүмкін болмады. Кейінірек қайталап көріңіз.');
      setCommenting(false);
    }
  };
  
  // Жұмысты жою функциясы
  const handleDeleteSubmission = async () => {
    if (!window.confirm('Сіз шынымен бұл жұмысты жоюғыңыз келе ме? Бұл әрекетті кері қайтару мүмкін емес.')) {
      return;
    }
    
    try {
      setDeleting(true);
      setError(null);
      await apiService.deleteSubmission(id);
      
      // Перенаправляем пользователя на страницу со списком работ
      navigate('/submissions');
    } catch (error) {
      console.error('Error deleting submission:', error);
      setError('Жұмысты жою мүмкін болмады. Кейінірек қайталап көріңіз.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Қате</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Жұмыс табылмады</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canReview = (user?.role === 'teacher' || user?.role === 'admin') && 
                    submission.status === 'verified' && 
                    !submission.teacher_review;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {submission.assignment_title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Студент: {submission.student_name} | Жүктелген: {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {showVerifyButton && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                verifying ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title="Жұмысты автоматты түрде тексеру"
            >
              {verifying ? (
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
                  Тексеру...
                </>
              ) : (
                'Жұмысты тексеру'
              )}
            </button>
          )}
          {canReview && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              title="Жұмысқа баға қою және пікір жазу"
            >
              {showReviewForm ? 'Болдырмау' : 'Жұмысты тексеру'}
            </button>
          )}
          {/* Кнопка удаления работы (только для преподавателей) */}
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <button
              onClick={handleDeleteSubmission}
              disabled={deleting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                deleting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title="Жұмысты жою"
            >
              {deleting ? (
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
                  Жою...
                </>
              ) : (
                'Жұмысты жою'
              )}
            </button>
          )}
        </div>
      </div>

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

      {/* Submission File */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Жұмыс файлы
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {submission.file_url ? submission.file_url.split('/').pop() : 'Файл қол жетімді емес'}
            </p>
          </div>
          {submission.file_url && (
            <a
              href={submission.file_url}
              download
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Файлды жүктеп алу
            </a>
          )}
        </div>
        <div className="border-t border-gray-200">
          {submission.file_url ? (
            <CodeViewer 
              fileUrl={submission.file_url} 
              fileExtension={submission.file_url.split('.').pop().toLowerCase()} 
              comments={codeComments}
            />
          ) : (
            <div className="p-4 text-sm text-gray-500">
              Файл көруге қол жетімді емес
            </div>
          )}
        </div>
      </div>

      {/* Verification Results */}
      {submission.verification_result && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Автоматты тексеру нәтижелері
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Тексерілген: {new Date(submission.verification_result.verified_at).toLocaleString()}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Синтаксис тексеру</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {submission.verification_result.syntax_check_passed ? (
                    <span className="text-green-600">Өтті</span>
                  ) : (
                    <span className="text-red-600">Өтпеді</span>
                  )}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Плагиатты тексеру</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={submission.verification_result.plagiarism_score > 50 ? 'text-red-600' : 'text-green-600'}>
                    {submission.verification_result.plagiarism_score.toFixed(2)}% сәйкестік
                  </span>
                </dd>
              </div>
              {!submission.verification_result.syntax_check_passed && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Синтаксис қателері</dt>
                  <dd className="mt-1 text-sm text-red-600 whitespace-pre-line">
                    {submission.verification_result.syntax_errors}
                  </dd>
                </div>
              )}
              {submission.verification_result.plagiarism_details && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Плагиатты тексеру егжей-тегжейлі мәліметтер</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {submission.verification_result.plagiarism_details}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Teacher Review */}
      {submission.teacher_review && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Оқытушының тексеруі
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Тексерген: {submission.teacher_review.teacher_name} | {new Date(submission.teacher_review.reviewed_at).toLocaleString()}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {submission.teacher_review.grade !== null && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Баға</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {submission.teacher_review.grade}/100
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Оқытушының пікірі</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {submission.teacher_review.comments}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Teacher Review Form */}
      {showReviewForm && (
        <TeacherReviewForm
          submissionId={submission.id}
          onSubmit={handleReview}
          onCancel={() => setShowReviewForm(false)}
          loading={reviewing}
        />
      )}

      {/* Code Comment Form (for teachers) */}
      {(user?.role === 'teacher' || user?.role === 'admin') && submission.status !== 'pending' && (
        <CodeCommentForm
          submissionId={submission.id}
          onSubmit={handleAddCodeComment}
          loading={commenting}
        />
      )}
    </div>
  );
};

export default SubmissionDetailPage;
