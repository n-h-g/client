import {config} from '../configuration/Configuration';

/**
 * The credentials of the login, kept in this browser:
 * - the token of the account service (login page), in localStorage with "Remember me", else in sessionStorage
 *   (closed with the tab);
 * - the legacy SSO (/sso/<user id>), only with config.auth.legacySso.
 */

const TOKEN_KEY = 'nhg_token';
const SSO_KEY = 'nhg_sso';

function read(storage: () => Storage, key: string): string | null {
    try { return storage().getItem(key); } catch { return null; }
}

function write(storage: () => Storage, key: string, value: string | null): void {
    try {
        if (value == null) storage().removeItem(key);
        else storage().setItem(key, value);
    } catch { /* storage blocked (private window): only this page */ }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

/** The expiration of a JWT (ms), null if it can't be read. */
function expirationOf(token: string): number | null {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const exp = JSON.parse(atob(payload)).exp;
        return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
        return null;
    }
}

/** The token of the account, if there is one not expired. */
export function getToken(): string | null {
    const token = read(session, TOKEN_KEY) ?? read(local, TOKEN_KEY);
    if (!token) return null;

    const expiration = expirationOf(token);
    if (expiration != null && expiration <= Date.now()) {
        clearToken();
        return null;
    }
    return token;
}

export function saveToken(token: string, remember: boolean): void {
    clearToken();
    write(remember ? local : session, TOKEN_KEY, token);
}

export function clearToken(): void {
    write(local, TOKEN_KEY, null);
    write(session, TOKEN_KEY, null);
}

export function rememberLegacySso(sso: string): void {
    write(local, SSO_KEY, sso);
}

/** The last legacy SSO of this browser (the link of a room has none), only if the legacy SSO is enabled. */
export function getLegacySso(): string | null {
    return config.auth.legacySso ? read(local, SSO_KEY) : null;
}

export function clearLegacySso(): void {
    write(local, SSO_KEY, null);
}

export function hasCredentials(): boolean {
    return getToken() != null || getLegacySso() != null;
}

export function logout(): void {
    clearToken();
    clearLegacySso();
}

/* ---------------------------------------------------------------- the account service */

export interface AuthResult {
    token: string;
    username: string;
}

export class AuthError extends Error {
    constructor(readonly code: string, message: string) {
        super(message);
    }
}

const UNREACHABLE = 'The account service is unreachable, please try again shortly';

async function post(path: string, body: object): Promise<AuthResult> {
    let response: Response;
    try {
        response = await fetch(`${config.auth.accountApiUrl}/${path}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        });
    } catch {
        throw new AuthError('unreachable', UNREACHABLE);
    }

    let data: any = null;
    try { data = await response.json(); } catch { /* not JSON: a proxy error page */ }

    if (response.ok && data?.token) return data as AuthResult;

    if (response.status === 429)
        throw new AuthError('too_many_requests', 'Too many attempts, please try again in a minute');
    if (data?.message)
        throw new AuthError(data.error ?? `http_${response.status}`, data.message);
    throw new AuthError(`http_${response.status}`, UNREACHABLE);
}

export function login(username: string, password: string): Promise<AuthResult> {
    return post('login', {username, password});
}

export function register(username: string, email: string, password: string): Promise<AuthResult> {
    return post('register', {username, email, password});
}
