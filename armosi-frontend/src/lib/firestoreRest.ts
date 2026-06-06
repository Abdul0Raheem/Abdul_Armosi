import crypto from 'crypto';

type FirestorePrimitive = string | number | boolean | null;
type FirestoreValue = FirestorePrimitive | FirestoreValue[] | { [key: string]: FirestoreValue };

interface FirestoreFields {
  [key: string]: unknown;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!projectId) {
    throw new Error('Firebase project credentials are not configured.');
  }

  return { projectId, apiKey };
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

async function getServiceAccountToken() {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) return null;

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsignedToken = `${header}.${claim}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(privateKey);
  const assertion = `${unsignedToken}.${base64Url(signature)}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error_description || 'Could not authenticate Firebase service account.');
  }

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000,
  };

  return cachedAccessToken.token;
}

function toFirestoreValue(value: FirestoreValue): FirestoreFields {
  if (value === null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: value.toString() };
    return { doubleValue: value };
  }
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(item => toFirestoreValue(item as FirestoreValue)) } };
  }

  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item as FirestoreValue)]),
      ),
    },
  };
}

function toFirestoreFields(data: Record<string, FirestoreValue>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)]),
  );
}

export async function createFirestoreDocument(
  collectionName: string,
  documentId: string,
  data: Record<string, FirestoreValue>,
  authToken?: string,
) {
  const { projectId, apiKey } = getFirebaseConfig();
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`);
  url.searchParams.set('documentId', documentId);
  const accessToken = await getServiceAccountToken();

  if (!accessToken && !authToken) {
    if (!apiKey) throw new Error('Firebase API key is not configured.');
    url.searchParams.set('key', apiKey);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken || authToken ? { Authorization: `Bearer ${accessToken || authToken}` } : {}),
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Could not save Firestore document.');
  }

  return payload;
}

export async function listFirestoreDocuments(collectionName: string) {
  const documents: unknown[] = [];
  let pageToken: string | undefined;

  do {
    const payload = await listFirestoreDocumentsPage(collectionName, pageToken);
    if (Array.isArray(payload.documents)) {
      documents.push(...payload.documents);
    }
    pageToken = typeof payload.nextPageToken === 'string' ? payload.nextPageToken : undefined;
  } while (pageToken);

  return { documents };
}

async function listFirestoreDocumentsPage(collectionName: string, pageToken?: string) {
  const { projectId, apiKey } = getFirebaseConfig();
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`,
  );
  const accessToken = await getServiceAccountToken();

  if (!accessToken) {
    if (!apiKey) throw new Error('Firebase API key is not configured.');
    url.searchParams.set('key', apiKey);
  }

  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }

  const response = await fetch(url, {
    cache: 'no-store',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || `Could not list Firestore documents (${response.status}).`;
    throw new Error(message);
  }

  return payload;
}

export async function updateFirestoreDocument(
  collectionName: string,
  documentId: string,
  data: Record<string, FirestoreValue>,
  authToken?: string,
) {
  const { projectId, apiKey } = getFirebaseConfig();
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${documentId}`);
  Object.keys(data).forEach(key => url.searchParams.append('updateMask.fieldPaths', key));
  const accessToken = await getServiceAccountToken();

  if (!accessToken && !authToken) {
    if (!apiKey) throw new Error('Firebase API key is not configured.');
    url.searchParams.set('key', apiKey);
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken || authToken ? { Authorization: `Bearer ${accessToken || authToken}` } : {}),
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Could not update Firestore document.');
  }

  return payload;
}
