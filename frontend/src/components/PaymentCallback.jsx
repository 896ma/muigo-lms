import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentCallback = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState('verifying');
	const [message, setMessage] = useState('Verifying your payment...');
	const [courseInfo, setCourseInfo] = useState(null);

	useEffect(() => {
		const verifyPayment = async () => {
			try {
				const reference = searchParams.get('reference');
				const trxref = searchParams.get('trxref');
				
				if (!reference && !trxref) {
					setStatus('error');
					setMessage('No payment reference found');
					return;
				}

				const paymentRef = reference || trxref;
				console.log('Verifying payment with reference:', paymentRef);

				// No authentication required for payment verification
				const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'http://localhost:5175/payment-callback');
				console.log('Using API URL for payment verification:', apiUrl);
				
				const response = await fetch(`${apiUrl}/api/payments/verify/${paymentRef}`, {
					method: 'GET'
				});

				const data = await response.json();
				console.log('Payment verification response:', data);

				if (response.ok && data.success) {
					setStatus('success');
					setMessage(data.message || 'Payment successful! You are now enrolled in the course.');
					setCourseInfo(data.course);
					
					// Store user info if available
					if (data.user) {
						localStorage.setItem('user', JSON.stringify(data.user));
					}
					
					// Redirect to specific course or portal after 3 seconds
					setTimeout(() => {
						if (data.course && data.course.slug) {
							console.log('Redirecting to course:', data.course.slug);
							// Force refresh enrollment status by adding a timestamp parameter
							navigate(`/courses/${data.course.slug}?enrolled=true&t=${Date.now()}`);
						} else {
							console.log('No course info, redirecting to portal');
							navigate('/portal');
						}
					}, 3000);
				} else {
					setStatus('error');
					setMessage(data.message || 'Payment verification failed');
				}
			} catch (error) {
				console.error('Payment verification error:', error);
				setStatus('error');
				setMessage('Payment verification failed. Please contact support.');
			}
		};

		verifyPayment();
	}, [searchParams, navigate]);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
				{status === 'verifying' && (
					<>
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jungle-500 mx-auto mb-4"></div>
						<h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
						<p className="text-gray-600">{message}</p>
					</>
				)}

				{status === 'success' && (
					<>
						<div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h2>
						<p className="text-gray-600 mb-4">{message}</p>
						{courseInfo && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
								<p className="text-sm text-green-800 font-medium">Course: {courseInfo.title}</p>
								<p className="text-xs text-green-600">You now have access to this course!</p>
							</div>
						)}
						<p className="text-sm text-gray-500 mb-4">
							{courseInfo ? 'Redirecting to your course...' : 'Redirecting to your portal...'}
						</p>
						{courseInfo && (
							<button
								onClick={() => navigate(`/courses/${courseInfo.slug}`)}
								className="bg-jungle-500 text-white px-4 py-2 rounded-lg hover:bg-jungle-600 mr-2"
							>
								Go to Course
							</button>
						)}
						<button
							onClick={() => navigate('/portal')}
							className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
						>
							Go to Portal
						</button>
					</>
				)}

				{status === 'error' && (
					<>
						<div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-red-800 mb-2">Payment Failed</h2>
						<p className="text-gray-600 mb-4">{message}</p>
						<button
							onClick={() => navigate('/courses')}
							className="bg-jungle-500 text-white px-4 py-2 rounded-lg hover:bg-jungle-600"
						>
							Back to Courses
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default PaymentCallback;