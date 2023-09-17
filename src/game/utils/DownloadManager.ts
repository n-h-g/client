export async function fetchJsonAsync<T>(url: string): Promise<T> {
    const options: RequestInit = {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        credentials: 'omit',
    };

    const result = await fetch(url, options);
    if (result == null) return null;

    const json = await result.json();
    if (json == null) return null;

    return json as T;
}
