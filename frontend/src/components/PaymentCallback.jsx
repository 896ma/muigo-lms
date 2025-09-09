import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiPost } from '../lib/api.js';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            const reference = searchParams.get('reference');
            if (!reference) {
                setStatus('error');
                setMessage('No payment reference found');
                return;
            }

            const result = await apiPost('/api/payments/verify', { reference });
            setStatus('success');
            setMessage('Payment successful! You have been enrolled in the course.');
            
            // Redirect to portal after 3 seconds
            setTimeout(() => {
                navigate('/portal');
            }, 3000);

        } catch (error) {
            setStatus('error');
            setMessage('Payment verification failed: ' + error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                {status === 'verifying' && (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jungle-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
                        <p className="text-gray-600">Please wait while we verify your payment.</p>
                    </div>
                )}
                
                {status === 'success' && (
                    <div>
                        <div className="text-green-600 text-6xl mb-4">✓</div>
                        <h2 className="text-xl font-semibold mb-2 text-green-800">Payment Successful!</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to your portal...</p>
                    </div>
                )}
                
                {status === 'error' && (
                    <div>
                        <div className="text-red-600 text-6xl mb-4">✗</div>
                        <h2 className="text-xl font-semibold mb-2 text-red-800">Payment Failed</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <button 
                            onClick={() => navigate('/courses')}
                            className="px-4 py-2 bg-jungle-600 text-white rounded hover:bg-jungle-700"
                        >
                            Back to Courses
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;
