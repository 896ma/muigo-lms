import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api.js';
import { isAuthed } from '../lib/auth.js';

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

    useEffect(() => {
        loadCourse();
        checkAuthStatus();
    }, [slug]);

    const checkAuthStatus = () => {
        setIsAuthenticated(isAuthed());
    };

    const loadCourse = async () => {
        try {
            setLoading(true);
            const data = await apiGet(`/api/courses/${slug}`);
            setCourse(data);
            
            // Check if user can access content (enrolled or free)
            const canAccess = data.isFree || data.lessons?.some(l => l.contentHtml);
            setIsEnrolled(canAccess);
            
            // Debug logging
            console.log('Course loaded:', {
                title: data.title,
                isFree: data.isFree,
                price: data.price,
                canAccess,
                isEnrolled: canAccess
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
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
                    await apiPost(`/api/courses/${course._id}/enroll`);
                    alert('Successfully enrolled in free course!');
                    setIsEnrolled(true);
                    navigate('/portal');
                } catch (err) {
                    // If enrollment fails due to auth, show a message but don't block
                    alert('Free course content unlocked! (Note: Full enrollment requires login)');
                    setIsEnrolled(true);
                }
            } else {
                // Paid course - initialize Paystack payment
                try {
                    const paymentData = await apiPost('/api/payments/initialize', {
                        courseId: course._id,
                        email: email
                    });
                    
                    // Redirect to Paystack payment page
                    window.location.href = paymentData.authorization_url;
                } catch (err) {
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
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img 
                    src={course.coverImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop'} 
                    alt={course.title}
                    className="w-full h-64 object-cover"
                />
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-jungle-600">
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
                        <h3 className="text-lg font-semibold mb-3">Course Content</h3>
                        {course.lessons && course.lessons.length > 0 ? (
                            <div className="space-y-2">
                                {course.lessons.map((lesson, index) => (
                                    <div key={lesson._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div>
                                            <div className="font-medium">{lesson.title}</div>
                                            {lesson.duration && (
                                                <div className="text-sm text-gray-500">{lesson.duration}</div>
                                            )}
                                        </div>
                                        {isEnrolled ? (
                                            <span className="text-green-600 text-sm">✓ Available</span>
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
                                disabled={enrolling || (!course.isFree && !email)}
                                className={`px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 transform hover:scale-105 ${
                                    course.isFree 
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
                                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl border-4 border-red-800'
                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
                                style={{
                                    backgroundColor: course.isFree ? '#16a34a' : '#dc2626',
                                    border: course.isFree ? 'none' : '4px solid #991b1b',
                                    boxShadow: '0 10px 25px rgba(220, 38, 38, 0.4)',
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
                                    className="px-8 py-4 text-lg font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                                        className="text-jungle-600 hover:text-jungle-700 font-semibold ml-1"
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
    );
};

export default CourseDetail;
