import { getToken } from './auth.js'

function resolveApiBaseUrl() {
	const envUrl = import.meta.env.VITE_API_URL?.trim()
	if (envUrl) return envUrl
	if (typeof window !== 'undefined' && window.location?.origin) {
		// Prefer same-origin API when frontend and backend are served together.
		const { hostname, origin } = window.location
		const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
		if (!isLocalhost) return origin
	}
	return 'http://localhost:5000'
}

export const API_BASE_URL = resolveApiBaseUrl()

export async function apiGet(path, options = {}) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
	
	try {
		const token = getToken();
		const headers = {}
		
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
			throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Check backend status and VITE_API_URL.`);
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


