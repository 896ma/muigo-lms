import { getToken } from './auth.js'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiGet(path) {
	const res = await fetch(`${API_BASE_URL}${path}`, {
		credentials: 'include',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
	});
	if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
	return res.json();
}

export async function apiPost(path, body) {
	const res = await fetch(`${API_BASE_URL}${path}`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
		body: JSON.stringify(body ?? {}),
	});
	if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
	return res.json();
}


