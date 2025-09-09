import { getToken } from './auth.js'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiGet(path, options = {}) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
	
	try {
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
		
		if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
		return res.json();
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === 'AbortError') {
			throw new Error('Request timeout - server not responding');
		}
		throw error;
	}
}

export async function apiPost(path, body, options = {}) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
	
	try {
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
		
		if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
		return res.json();
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === 'AbortError') {
			throw new Error('Request timeout - server not responding');
		}
		throw error;
	}
}


