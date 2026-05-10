import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function resolveCallbackApiUrl() {
	const envUrl = import.meta.env.VITE_API_URL?.trim();
	if (envUrl) return envUrl.replace(/\/$/, '');
	// Use same-origin so Vite proxy forwards /api → localhost:5000 on dev,
	// and on production the frontend and backend share the same origin.
	if (typeof window !== 'undefined') {
		return window.location.origin.replace(/\/$/, '');
	}
	return '';
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PaymentCallback = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState('verifying');
	const [message, setMessage] = useState('Verifying your payment...');
	const [courseInfo, setCourseInfo] = useState(null);
	const abortedRef = useRef(false);

	useEffect(() => {
		abortedRef.current = false;
		return () => {
			abortedRef.current = true;
		};
	}, []);

	useEffect(() => {
		const verifyPayment = async () => {
			const reference = searchParams.get('reference');
			const trxref = searchParams.get('trxref');

			if (!reference && !trxref) {
				setStatus('error');
				setMessage('No payment reference found');
				return;
			}

			const paymentRef = (reference || trxref).trim();
			const apiUrl = resolveCallbackApiUrl();
			const MAX_ATTEMPTS = 50;
			const INTERVAL_MS = 800;

			for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
				if (abortedRef.current) return;

				try {
					setMessage(
						attempt === 0
							? 'Verifying your payment...'
							: `Still confirming with Paystack (try ${attempt + 1} of ${MAX_ATTEMPTS}). This is normal for M-Pesa.`
					);

					const response = await fetch(
						`${apiUrl}/api/payments/verify/${encodeURIComponent(paymentRef)}`,
						{ method: 'GET', credentials: 'omit' }
					);

					let data = {};
					try {
						data = await response.json();
					} catch {
						data = {};
					}

					if (abortedRef.current) return;

					if (response.ok && data.success) {
						setStatus('success');
						setMessage(data.message || 'Payment successful! You are now enrolled in the course.');
						setCourseInfo(data.course || null);

						if (data.user) {
							const existingToken = localStorage.getItem('token');
							localStorage.setItem('user', JSON.stringify(data.user));
							if (existingToken) localStorage.setItem('token', existingToken);
						}

						setTimeout(() => {
							if (data.course?.slug) {
								navigate(`/courses/${data.course.slug}?enrolled=true&t=${Date.now()}`);
							} else {
								navigate('/portal');
							}
						}, 300);
						return;
					}

					// Backend signals "keep polling" (mobile money still pending)
					if (data.pending === true) {
						await sleep(INTERVAL_MS);
						continue;
					}

					// Hard failure from Paystack / our API
					if (response.status === 400) {
						setStatus('error');
						setMessage(data.message || 'Payment verification failed');
						return;
					}

					// Transient server errors — retry
					if (response.status >= 500) {
						await sleep(INTERVAL_MS);
						continue;
					}

					// Unknown response — retry a few times then fail
					if (attempt >= MAX_ATTEMPTS - 1) {
						setStatus('error');
						setMessage(data.message || 'Payment verification could not be completed. Please check your portal or contact support.');
						return;
					}
					await sleep(INTERVAL_MS);
				} catch (error) {
					console.error('Payment verification error:', error);
					if (attempt >= MAX_ATTEMPTS - 1) {
						setStatus('error');
						setMessage('Payment verification failed. Your payment may still have succeeded — check My Portal or contact support.');
						return;
					}
					await sleep(INTERVAL_MS);
				}
			}

			setStatus('error');
			setMessage('Confirmation is taking longer than expected. If you were charged, open My Portal — your course may already be unlocked.');
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
						<p className="text-gray-600 text-sm">{message}</p>
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
						<h2 className="text-xl font-semibold text-red-800 mb-2">Could not confirm payment</h2>
						<p className="text-gray-600 mb-4 text-sm">{message}</p>
						<button
							onClick={() => navigate('/portal')}
							className="bg-jungle-500 text-white px-4 py-2 rounded-lg hover:bg-jungle-600 mr-2"
						>
							My Portal
						</button>
						<button
							onClick={() => navigate('/courses')}
							className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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
