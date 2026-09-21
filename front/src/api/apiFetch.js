import { supabase } from '../lib/Supabaseclient';

export async function apiFetch(url, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();

    const headers = {
        ...(options.headers || {}),
    };

    if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        await supabase.auth.signOut();
    }

    return response;
}