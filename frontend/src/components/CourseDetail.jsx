import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api.js';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        loadCourse();
    }, [slug]);

    const loadCourse = async () => {
        try {
            setLoading(true);
            const data = await apiGet(`/api/courses/${slug}`);
            setCourse(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!email) {
            alert('Please enter your email address');
            return;
        }

        try {
            setEnrolling(true);
            
            if (course.isFree) {
                // Free course - enroll directly
                await apiPost(`/api/courses/${course._id}/enroll`);
                alert('Successfully enrolled in free course!');
                navigate('/portal');
            } else {
                // Paid course - initialize Paystack payment
                const paymentData = await apiPost('/api/payments/initialize', {
                    courseId: course._id,
                    email: email
                });
                
                // Redirect to Paystack payment page
                window.location.href = paymentData.authorization_url;
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

    const canAccessContent = course.isFree || course.lessons?.some(l => l.contentHtml);

    return (
        <div className="max-w-4xl mx-auto">
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
                                        {canAccessContent ? (
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

                    {!canAccessContent && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-yellow-800 mb-2">Course Access Required</h4>
                            <p className="text-yellow-700 text-sm">
                                This course requires enrollment. Enter your email below to proceed with payment.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {!canAccessContent && (
                            <div className="flex-1">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jungle-500"
                                />
                            </div>
                        )}
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling || (!canAccessContent && !email)}
                            className="px-6 py-2 bg-jungle-600 text-white rounded-md hover:bg-jungle-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {enrolling ? 'Processing...' : 
                             course.isFree ? 'Enroll Free' : 
                             'Pay & Enroll'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
