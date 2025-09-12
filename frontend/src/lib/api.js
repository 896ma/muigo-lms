import { getToken } from './auth.js'
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000');

export async function apiGet(path, options = {}) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
	
	try {
		console.log(`Making API request to: ${API_BASE_URL}${path}`);
		const res = await fetch(`${API_BASE_URL}${path}`, {
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json', 
				Authorization: `Bearer ${getToken()}` 
			},
			signal: controller.signal,
			...options
		});
		clearTimeout(timeoutId);
		
		console.log(`API response status: ${res.status}`);
		if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
		return res.json();
	} catch (error) {
		clearTimeout(timeoutId);
		console.error(`API request failed:`, error);
		if (error.name === 'AbortError') {
			throw new Error('Request timeout - server not responding');
		}
		if (error.message.includes('Failed to fetch')) {
			throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 5000.');
		}
		throw error;
	}
}

export async function apiPost(path, body, options = {}) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
	
	try {
		console.log(`Making API POST request to: ${API_BASE_URL}${path}`);
		const res = await fetch(`${API_BASE_URL}${path}`, {
			method: 'POST',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json', 
				Authorization: `Bearer ${getToken()}` 
			},
			body: JSON.stringify(body ?? {}),
			signal: controller.signal,
			...options
		});
		clearTimeout(timeoutId);
		
		console.log(`API POST response status: ${res.status}`);
		if (!res.ok) throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}`);
		return res.json();
	} catch (error) {
		clearTimeout(timeoutId);
		console.error(`API POST request failed:`, error);
		if (error.name === 'AbortError') {
			throw new Error('Request timeout - server not responding');
		}
		if (error.message.includes('Failed to fetch')) {
			throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 5000.');
		}
		throw error;
	}
}


