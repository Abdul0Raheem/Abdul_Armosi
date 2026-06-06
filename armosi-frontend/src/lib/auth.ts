import {
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export class AdminAccessError extends Error {
  constructor() {
    super('This account does not have admin access.');
    this.name = 'AdminAccessError';
  }
}

export function getAuthErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code: string }).code)
    : '';

  if (code === 'auth/email-already-in-use') return 'This email is already registered. Try signing in.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  if (code === 'auth/weak-password') return 'Password should be at least 6 characters.';
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Incorrect email or password.';
  }
  if (code === 'auth/popup-closed-by-user') return 'Google sign-in was cancelled.';
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked. Allow popups for this site, or try again and we will use redirect.';
  }
  if (code === 'auth/cancelled-popup-request') return 'Please wait and try Google sign-in again.';
  if (code === 'auth/unauthorized-domain') {
    return 'This website is not authorized for sign-in. Please contact support.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is not enabled yet. Please contact support.';
  }
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
  if (code.startsWith('auth/')) return 'Login failed. Please check your details and try again.';

  if (error instanceof AdminAccessError) {
    return error.message;
  }

  const message = typeof error === 'object' && error && 'message' in error
    ? String((error as { message: string }).message)
    : '';

  return message || 'Something went wrong. Please try again.';
}

export async function ensureAuthPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

async function saveUserProfile(user: FirebaseUser, name: string) {
  const userRef = doc(db, 'users', user.uid);
  const existingProfile = await getDoc(userRef);
  const existingRole = existingProfile.exists() ? existingProfile.data().role : null;

  await setDoc(
    userRef,
    {
      name: name.trim() || user.displayName || 'Armosi Customer',
      email: user.email || '',
      role: existingRole === 'admin' ? 'admin' : 'customer',
      updatedAt: serverTimestamp(),
      ...(existingProfile.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  await ensureAuthPersistence();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: name.trim() });
  await saveUserProfile(credential.user, name);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  await ensureAuthPersistence();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function getUserRole(uid: string): Promise<UserProfile['role'] | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) return null;

  const role = snapshot.data().role;
  return role === 'admin' || role === 'customer' ? role : null;
}

export async function userIsAdmin(uid: string) {
  return (await getUserRole(uid)) === 'admin';
}

export async function signInAdminWithEmail(email: string, password: string) {
  await ensureAuthPersistence();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const userRef = doc(db, 'users', credential.user.uid);

  try {
    const existingProfile = await getDoc(userRef);
    const existingRole = existingProfile.exists() ? existingProfile.data().role : null;

    if (existingRole && existingRole !== 'admin') {
      await signOut(auth);
      throw new AdminAccessError();
    }

    await setDoc(
      userRef,
      {
        name: credential.user.displayName || 'Admin',
        email: credential.user.email || email.trim(),
        role: 'admin',
        updatedAt: serverTimestamp(),
        ...(existingProfile.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
  } catch (error) {
    if (error instanceof AdminAccessError) throw error;
    console.warn('Admin profile sync failed after login:', error);
  }

  return credential.user;
}

function buildGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export async function completeGoogleRedirectSignIn() {
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;

  await saveUserProfile(
    result.user,
    result.user.displayName || result.user.email?.split('@')[0] || 'Customer',
  );
  return result.user;
}

export async function signInWithGoogleAccount() {
  await ensureAuthPersistence();
  const provider = buildGoogleProvider();

  try {
    const credential = await signInWithPopup(auth, provider);
    await saveUserProfile(
      credential.user,
      credential.user.displayName || credential.user.email?.split('@')[0] || 'Customer',
    );
    return credential.user;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error
      ? String((error as { code: string }).code)
      : '';

    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    throw error;
  }
}

export async function signOutUser() {
  await signOut(auth);
}

export function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
