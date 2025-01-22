import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/config';

export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('Logged in anonymously:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in anonymously:', error);
    throw error;
  }
};
