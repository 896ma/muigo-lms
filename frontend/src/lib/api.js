import { getToken } from './auth.js'
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://muigo-farmers-lms.onrender.com');

export async function apiGet(path, options = {}) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
	
	try {
		const token = getToken();
		const headers = { 
			'Content-Type': 'application/json'
		};
		
		// Only add Authorization header if we have a valid token
		if (token && token.trim() !== '') {
			headers.Authorization = `Bearer ${token}`;
		}
		
		const res = await fetch(`${API_BASE_URL}${path}`, {
			headers,
			signal: controller.signal,
			...options
		});
		clearTimeout(timeoutId);
		
		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`GET ${path} failed: ${res.status} ${res.statusText} - ${errorText}`);
		}
		return res.json();
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === 'AbortError') {
			throw new Error('Request timeout - server not responding after 30 seconds');
		}
		if (error.message.includes('Failed to fetch')) {
			throw new Error('Cannot connect to backend server. Please check your internet connection and try again.');
		}
		throw error;
	}
}

export async function apiPost(path, body, options = {}) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
	
	try {
		const token = getToken();
		const headers = { 
			'Content-Type': 'application/json'
		};
		
		// Only add Authorization header if we have a valid token
		if (token && token.trim() !== '') {
			headers.Authorization = `Bearer ${token}`;
		}
		
		const res = await fetch(`${API_BASE_URL}${path}`, {
			method: 'POST',
			headers,
			body: JSON.stringify(body ?? {}),
			signal: controller.signal,
			...options
		});
		clearTimeout(timeoutId);
		
		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`POST ${path} failed: ${res.status} ${res.statusText} - ${errorText}`);
		}
		return res.json();
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === 'AbortError') {
			throw new Error('Request timeout - server not responding after 30 seconds');
		}
		if (error.message.includes('Failed to fetch')) {
			throw new Error('Cannot connect to backend server. Please check your internet connection and try again.');
		}
		throw error;
	}
}


