import { Capacitor } from '@capacitor/core';
import {
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  EmailAuthProvider,
  getRedirectResult,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword,
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

export class AuthService {
  isNativePlatform() {
    return Capacitor.isNativePlatform();
  }

  getAuthErrorMessage(error: unknown) {
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
    if (code === 'auth/missing-google-id-token') {
      return 'Google sign-in did not return a valid token. Please try again.';
    }
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
    if (code === 'auth/requires-recent-login') return 'Please sign in again before changing your password.';
    if (code === 'auth/provider-already-linked' || code === 'auth/credential-already-in-use') return 'This sign-in method is already linked.';
    if (code === 'auth/missing-password') return 'Please enter your password.';
    if (code.startsWith('auth/')) return 'Login failed. Please check your details and try again.';

    if (error instanceof AdminAccessError) {
      return error.message;
    }

    const message = typeof error === 'object' && error && 'message' in error
      ? String((error as { message: string }).message)
      : '';

    if (/cancel/i.test(message)) return 'Google sign-in was cancelled.';
    return message || 'Something went wrong. Please try again.';
  }

  async ensureAuthPersistence() {
    await setPersistence(auth, browserLocalPersistence);
  }

  async signUpWithEmail(name: string, email: string, password: string) {
    await this.ensureAuthPersistence();
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: name.trim() });
    await this.saveUserProfile(credential.user, name);
    return credential.user;
  }

  async signInWithEmail(email: string, password: string) {
    await this.ensureAuthPersistence();
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  }

  async getUserRole(uid: string): Promise<UserProfile['role'] | null> {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (!snapshot.exists()) return null;

    const role = snapshot.data().role;
    return role === 'admin' || role === 'customer' ? role : null;
  }

  async userIsAdmin(uid: string) {
    return (await this.getUserRole(uid)) === 'admin';
  }

  async signInAdminWithEmail(email: string, password: string) {
    await this.ensureAuthPersistence();
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

  async completeGoogleRedirectSignIn() {
    if (this.isNativePlatform()) return null;

    const result = await getRedirectResult(auth);
    if (!result?.user) return null;

    await this.saveUserProfile(
      result.user,
      result.user.displayName || result.user.email?.split('@')[0] || 'Customer',
    );
    return result.user;
  }

  async signInWithGoogleAccount() {
    await this.ensureAuthPersistence();

    if (this.isNativePlatform()) {
      return this.signInWithNativeGoogle();
    }

    return this.signInWithWebGoogle();
  }

  async signOutUser() {
    if (this.isNativePlatform()) {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      await FirebaseAuthentication.signOut().catch(error => {
        console.warn('Native Google sign-out failed:', error);
      });
    }

    await signOut(auth);
  }

  async updateUserPassword(currentPassword: string, newPassword: string) {
    const currentUser = auth.currentUser;

    if (!currentUser?.email) {
      throw new Error('Please sign in with an email account to update your password.');
    }

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  }

  async sendPasswordReset(email: string) {
    await sendPasswordResetEmail(auth, email.trim());
  }

  getUserInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'A';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  private async signInWithNativeGoogle() {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    const nativeResult = await FirebaseAuthentication.signInWithGoogle({
      skipNativeAuth: true,
      scopes: ['email', 'profile'],
    });

    const idToken = nativeResult.credential?.idToken;
    if (!idToken) {
      throw { code: 'auth/missing-google-id-token' };
    }

    const googleCredential = GoogleAuthProvider.credential(
      idToken,
      nativeResult.credential?.accessToken,
    );
    const credential = await signInWithCredential(auth, googleCredential);
    await this.saveUserProfile(
      credential.user,
      nativeResult.user?.displayName || credential.user.displayName || credential.user.email?.split('@')[0] || 'Customer',
    );
    return credential.user;
  }

  private async signInWithWebGoogle() {
    const provider = this.buildGoogleProvider();

    try {
      const credential = await signInWithPopup(auth, provider);
      await this.saveUserProfile(
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

  private buildGoogleProvider() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  }

  private async saveUserProfile(user: FirebaseUser, name: string) {
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
}

export const authService = new AuthService();
