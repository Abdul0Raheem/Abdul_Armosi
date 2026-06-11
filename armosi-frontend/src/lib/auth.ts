import { authService, type UserProfile } from '@/lib/AuthService';

export { AdminAccessError, authService, type UserProfile } from '@/lib/AuthService';

export function getAuthErrorMessage(error: unknown) {
  return authService.getAuthErrorMessage(error);
}

export function ensureAuthPersistence() {
  return authService.ensureAuthPersistence();
}

export function signUpWithEmail(name: string, email: string, password: string) {
  return authService.signUpWithEmail(name, email, password);
}

export function signInWithEmail(email: string, password: string) {
  return authService.signInWithEmail(email, password);
}

export function getUserRole(uid: string): Promise<UserProfile['role'] | null> {
  return authService.getUserRole(uid);
}

export function userIsAdmin(uid: string) {
  return authService.userIsAdmin(uid);
}

export function signInAdminWithEmail(email: string, password: string) {
  return authService.signInAdminWithEmail(email, password);
}

export function completeGoogleRedirectSignIn() {
  return authService.completeGoogleRedirectSignIn();
}

export function signInWithGoogleAccount() {
  return authService.signInWithGoogleAccount();
}

export function signOutUser() {
  return authService.signOutUser();
}

export function updateUserPassword(currentPassword: string, newPassword: string) {
  return authService.updateUserPassword(currentPassword, newPassword);
}

export function sendPasswordReset(email: string) {
  return authService.sendPasswordReset(email);
}

export function getUserInitials(name: string) {
  return authService.getUserInitials(name);
}
