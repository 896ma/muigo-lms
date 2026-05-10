import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost, API_BASE_URL } from '../lib/api.js';
import { isAuthed } from '../lib/auth.js';

// Inline quiz component shown when user clicks a quiz lesson
const QuizModal = ({ lesson, onClose }) => {
    const questions = lesson.quiz?.questions || [];
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const score = submitted
        ? questions.filter((q, i) => answers[i] === q.answer).length
        : 0;

    if (!questions.length) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{lesson.title}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                    </div>

                    {!submitted ? (
                        <>
                            <div className="space-y-6">
                                {questions.map((q, qi) => (
                                    <div key={qi} className="border border-gray-200 rounded-lg p-4">
                                        <p className="font-medium text-gray-800 mb-3">{qi + 1}. {q.question}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oi) => (
                                                <label key={oi} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${answers[qi] === oi ? 'bg-jungle-50 border border-jungle-300' : 'hover:bg-gray-50'}`}>
                                                    <input
                                                        type="radio"
                                                        name={`q${qi}`}
                                                        checked={answers[qi] === oi}
                                                        onChange={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                                                        className="accent-jungle-500"
                                                    />
                                                    <span className="text-gray-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setSubmitted(true)}
                                disabled={Object.keys(answers).length < questions.length}
                                className="mt-6 w-full py-3 bg-jungle-500 text-white font-semibold rounded-lg hover:bg-jungle-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Submit Answers
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className={`text-5xl font-bold mb-2 ${score >= questions.length * 0.7 ? 'text-green-500' : 'text-orange-500'}`}>
                                {score}/{questions.length}
                            </div>
                            <p className="text-gray-600 mb-6">
                                {score >= questions.length * 0.7 ? '🎉 Well done! You passed.' : '📚 Review the material and try again.'}
                            </p>
                            <div className="space-y-4 text-left mb-6">
                                {questions.map((q, qi) => {
                                    const correct = answers[qi] === q.answer;
                                    return (
                                        <div key={qi} className={`p-3 rounded-lg border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <p className="font-medium text-sm text-gray-800">{qi + 1}. {q.question}</p>
                                            <p className="text-sm mt-1">
                                                {correct
                                                    ? <span className="text-green-700">✓ Correct: {q.options[q.answer]}</span>
                                                    : <><span className="text-red-600">✗ Your answer: {q.options[answers[qi]]}</span><br /><span className="text-green-700">Correct: {q.options[q.answer]}</span></>
                                                }
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Retry</button>
                                <button onClick={onClose} className="px-4 py-2 bg-jungle-500 text-white rounded-lg hover:bg-jungle-600">Close</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [email, setEmail] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const isEnrolledRef = useRef(false);
    const [quizLesson, setQuizLesson] = useState(null);

    // Update ref when state changes
    useEffect(() => {
        isEnrolledRef.current = isEnrolled;
    }, [isEnrolled]);

    useEffect(() => {
        loadCourse();
        checkAuthStatus();
    }, [slug]);

    // Refresh enrollment status when course loads (handles post-payment redirect with ?enrolled=true)
    useEffect(() => {
        if (!course || course.isFree) return;
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('enrolled') === 'true') {
            // Retry a couple of times to handle backend propagation delay
            checkEnrollmentStatus(0);
        } else if (isAuthenticated) {
            checkEnrollmentStatus(0);
        }
    }, [course, isAuthenticated]);

    const checkEnrollmentStatus = useCallback(async (retryCount = 0) => {
        if (!course) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/api/enrollments/me`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const enrollments = await response.json();
                const enrolled = enrollments.some(e => e.course && e.course._id === course._id);
                setIsEnrolled(enrolled);
                
                // Retry once more if coming from payment and not yet enrolled (backend may lag)
                if (!enrolled && retryCount < 2) {
                    setTimeout(() => checkEnrollmentStatus(retryCount + 1), 3000);
                }
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
        }
    }, [course]);

    const checkAuthStatus = () => {
        setIsAuthenticated(isAuthed());
        
        // Check if user is an admin
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setIsAdmin(user.role === 'admin');
            } catch (e) {
                setIsAdmin(false);
            }
        } else {
            setIsAdmin(false);
        }
    };

    const openLesson = (lesson) => {
        if (lesson.isQuiz && lesson.quiz?.questions?.length) {
            setQuizLesson(lesson);
            return;
        }
        if (lesson.contentHtml) {
            const lessonWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            lessonWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${lesson.title} - ${course.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        h1 { color: #29AB87; }
                        h2 { color: #1F876C; }
                        .lesson-content { max-width: 800px; margin: 0 auto; }
                        .back-button { 
                            background: #29AB87; 
                            color: white; 
                            padding: 10px 20px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block; 
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="lesson-content">
                        <a href="javascript:window.close()" class="back-button">← Close Lesson</a>
                        <h1>${lesson.title}</h1>
                        <p><strong>Duration:</strong> ${lesson.duration || 'Not specified'}</p>
                        <hr>
                        ${lesson.contentHtml}
                    </div>
                </body>
                </html>
            `);
            lessonWindow.document.close();
        } else {
            alert('Lesson content is not available yet.');
        }
    };

    const loadCourse = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiGet(`/api/courses/${slug}`);
            setCourse(data);
            
            // Check enrollment status properly
            if (data.isFree) {
                // Free courses are always accessible
                setIsEnrolled(true);
            } else {
                // For paid courses, check token directly (don't rely on isAuthenticated state which may not be set yet)
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/enrollments/me`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            const enrollments = await response.json();
                            const isEnrolledInCourse = enrollments.some(enrollment => 
                                enrollment.course && enrollment.course._id === data._id
                            );
                            setIsEnrolled(isEnrolledInCourse);
                        } else {
                            setIsEnrolled(false);
                        }
                    } catch (error) {
                        console.error('Error checking enrollment:', error);
                        setIsEnrolled(false);
                    }
                } else {
                    setIsEnrolled(false);
                }
            }
            
            // Course loaded successfully
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    const handleEnroll = async () => {
        // Prevent admins from enrolling
        if (isAdmin) {
            alert('Administrators cannot enroll in courses. Please use a farmer account to enroll.');
            return;
        }
        
        // For testing purposes, allow enrollment without authentication
        // In production, uncomment the authentication check below
        /*
        if (!isAuthenticated) {
            alert('Please log in to enroll in courses');
            navigate('/register');
            return;
        }
        */

        if (!course.isFree && !email) {
            alert('Please enter your email address for payment');
            return;
        }

        try {
            setEnrolling(true);
            
            if (course.isFree) {
                // Free course - enroll directly
                try {
                    const response = await apiPost(`/api/courses/${course._id}/enroll`);
                    alert(response.message || 'Successfully enrolled in free course!');
                    setIsEnrolled(true);
                    // Open first lesson if available
                    if (course.lessons && course.lessons.length > 0) {
                        const firstLesson = course.lessons[0];
                        if (firstLesson.contentHtml) {
                            // Create a new window/tab with the lesson content
                            const lessonWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                            lessonWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>${firstLesson.title} - ${course.title}</title>
                                    <style>
                                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                                        h1 { color: #29AB87; }
                                        h2 { color: #1F876C; }
                                        .lesson-content { max-width: 800px; margin: 0 auto; }
                                        .back-button { 
                                            background: #29AB87; 
                                            color: white; 
                                            padding: 10px 20px; 
                                            text-decoration: none; 
                                            border-radius: 5px; 
                                            display: inline-block; 
                                            margin-bottom: 20px;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="lesson-content">
                                        <a href="javascript:window.close()" class="back-button">← Close Lesson</a>
                                        <h1>${firstLesson.title}</h1>
                                        <p><strong>Duration:</strong> ${firstLesson.duration || 'Not specified'}</p>
                                        <hr>
                                        ${firstLesson.contentHtml}
                                    </div>
                                </body>
                                </html>
                            `);
                            lessonWindow.document.close();
                        } else {
                            alert('First lesson content is not available yet.');
                        }
                    } else {
                        alert('No lessons available for this course yet.');
                    }
                } catch {
                    // If enrollment fails, show a message but still unlock content
                    alert('Free course content unlocked! (Note: Full enrollment requires login)');
                    setIsEnrolled(true);
                    // Still try to open first lesson
                    if (course.lessons && course.lessons.length > 0) {
                        const firstLesson = course.lessons[0];
                        if (firstLesson.contentHtml) {
                            const lessonWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                            lessonWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>${firstLesson.title} - ${course.title}</title>
                                    <style>
                                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                                        h1 { color: #29AB87; }
                                        h2 { color: #1F876C; }
                                        .lesson-content { max-width: 800px; margin: 0 auto; }
                                        .back-button { 
                                            background: #29AB87; 
                                            color: white; 
                                            padding: 10px 20px; 
                                            text-decoration: none; 
                                            border-radius: 5px; 
                                            display: inline-block; 
                                            margin-bottom: 20px;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="lesson-content">
                                        <a href="javascript:window.close()" class="back-button">← Close Lesson</a>
                                        <h1>${firstLesson.title}</h1>
                                        <p><strong>Duration:</strong> ${firstLesson.duration || 'Not specified'}</p>
                                        <hr>
                                        ${firstLesson.contentHtml}
                                    </div>
                                </body>
                                </html>
                            `);
                            lessonWindow.document.close();
                        }
                    }
                }
            } else {
                // Paid course - initialize Paystack payment
                try {
                    const paymentData = await apiPost('/api/payments/initiate', {
                        courseId: course._id
                    });
                    
                    // Redirect to Paystack payment page
                    window.location.href = paymentData.authorization_url;
                } catch (err) {
                    console.error('Payment initialization error:', err);
                    alert('Payment initialization failed: ' + err.message + '\n\nNote: This requires proper Paystack configuration.');
                }
            }
        } catch (err) {
            alert('Enrollment failed: ' + err.message);
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="text-center py-8">Loading course...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
    if (!course) return <div className="text-center py-8">Course not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Very prominent red banner for paid courses */}
            {!course.isFree && (
                <div className="bg-red-600 text-white p-4 mb-4 rounded-lg text-center font-bold text-xl border-4 border-red-800" style={{backgroundColor: '#dc2626', boxShadow: '0 10px 25px rgba(220, 38, 38, 0.6)'}}>
                    🔥 PAID COURSE - Ksh {course.price} - SCROLL DOWN TO ENROLL! 🔥
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
                <div className="relative overflow-hidden">
                    <img 
                        src={course.coverImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop'} 
                        alt={course.title}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                        <div className="text-right">
							<div className="text-2xl font-bold text-jungle-500">
                                {course.isFree ? 'Free' : `Ksh ${course.price}`}
                            </div>
                            <div className="text-sm text-gray-500">{course.currency}</div>
                            {isEnrolled && (
                                <div className="text-sm text-green-600 font-semibold mt-1">
                                    ✓ Enrolled
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{course.description}</p>
                    
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-jungle-600">Course Content</h3>
                        {course.lessons && course.lessons.length > 0 ? (
                            <div className="space-y-2">
                                {course.lessons.map((lesson, index) => (
                                    <div 
                                        key={lesson._id || index} 
                                        className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                                            isEnrolled 
                                                ? 'bg-gray-50 hover:bg-jungle-50 border border-gray-200 hover:border-jungle-300' 
                                                : 'bg-gray-100'
                                        }`}
                                        onClick={() => isEnrolled && openLesson(lesson)}
                                    >
                                        <div>
                                            <div className="font-medium text-black">{lesson.title}</div>
                                            {lesson.duration && (
                                                <div className="text-sm text-gray-700">{lesson.duration}</div>
                                            )}
                                        </div>
                                        {isEnrolled ? (
                                            <span className="text-green-600 text-sm">{lesson.isQuiz ? '📝 Take Quiz' : '✓ Click to open'}</span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">🔒 Locked</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No lessons available yet.</p>
                        )}
                    </div>

                    {/* Debug Information - Remove in production */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-xs">
                        <h4 className="font-semibold text-blue-800 mb-2">Debug Info</h4>
                        <div className="text-blue-700 space-y-1">
                            <div>Course: {course.title}</div>
                            <div>Is Free: {course.isFree ? 'Yes' : 'No'}</div>
                            <div>Price: Ksh {course.price}</div>
                            <div>Is Enrolled: {isEnrolled ? 'Yes' : 'No'}</div>
                            <div>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
                            <div>Email: {email || 'Not provided'}</div>
                        </div>
                    </div>

                    {!isEnrolled && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-yellow-800 mb-2">
                                {course.isFree ? 'Free Course - Enroll Now' : 'Course Access Required'}
                            </h4>
                            <p className="text-yellow-700 text-sm">
                                {course.isFree 
                                    ? 'This is a free course. Click enroll to get started!'
                                    : 'This course requires payment. Enter your email below to proceed with payment.'
                                }
                            </p>
                        </div>
                    )}

                    {isAdmin && !isEnrolled && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-red-800 mb-2">⚠️ Administrator Account</h4>
                            <p className="text-red-700 text-sm">
                                Administrators cannot enroll in courses. Please use a farmer account to enroll and access course content.
                            </p>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-blue-800 mb-2">Login Required</h4>
                            <p className="text-blue-700 text-sm">
                                Please log in to enroll in courses.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons Section */}
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {course.isFree ? 'Ready to Start Learning?' : 'Ready to Enroll?'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {course.isFree 
                                    ? 'This course is completely free. Click below to get started!'
                                    : `Get full access to this course for just Ksh ${course.price}`
                                }
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {!isEnrolled && !course.isFree && (
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address (for payment receipt)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500 text-lg"
                                        required
                                    />
                                </div>
                            )}
                            
                            {/* Always show button for testing - remove authentication requirement temporarily */}
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling || isAdmin || (!course.isFree && !email)}
                                className={`px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 transform hover:scale-105 ${
                                    course.isFree 
                                        ? 'bg-jungle-500 hover:bg-jungle-600 text-white shadow-lg hover:shadow-xl' 
                                        : 'bg-jungle-500 hover:bg-jungle-600 text-white shadow-lg hover:shadow-xl border-4 border-jungle-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
                                style={{
                                    backgroundColor: course.isFree ? '#29AB87' : '#29AB87',
                                    border: course.isFree ? 'none' : '4px solid #1F876C',
                                    boxShadow: '0 10px 25px rgba(41, 171, 135, 0.4)',
                                    fontSize: '20px',
                                    fontWeight: '900',
                                    animation: course.isFree ? 'none' : 'pulse 2s infinite'
                                }}
                            >
                                {enrolling ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </span>
                                ) : course.isFree ? (
                                    '🎓 Enroll Free'
                                ) : (
                                    `💳 Pay Ksh ${course.price} & Enroll`
                                )}
                            </button>
                            
                            {isEnrolled && (
                                <button
                                    onClick={() => navigate('/portal')}
                                    className="px-8 py-4 text-lg font-bold bg-jungle-500 text-white rounded-lg hover:bg-jungle-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                >
                                    ✅ Go to Portal
                                </button>
                            )}
                        </div>

                        {/* Fallback button for testing - always visible */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => {
                                    alert(`Testing ${course.isFree ? 'free' : 'paid'} course: ${course.title}\nPrice: ${course.isFree ? 'Free' : `Ksh ${course.price}`}`);
                                }}
                                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg font-bold border-2 border-red-700"
                                style={{
                                    backgroundColor: '#ef4444',
                                    border: '3px solid #b91c1c',
                                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.5)',
                                    fontSize: '18px',
                                    fontWeight: '900',
                                    animation: 'blink 1s infinite'
                                }}
                            >
                                🧪 TEST BUTTON (ALWAYS VISIBLE)
                            </button>
                        </div>

                        {!isAuthenticated && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account? 
                                    <button 
                                        onClick={() => navigate('/register')}
								className="text-jungle-500 hover:text-jungle-600 font-semibold ml-1"
                                    >
                                        Sign up here
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        {quizLesson && <QuizModal lesson={quizLesson} onClose={() => setQuizLesson(null)} />}
    );
};

export default CourseDetail;
