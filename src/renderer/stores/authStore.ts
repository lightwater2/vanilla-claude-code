/**
 * Authentication Store
 *
 * Manages GitHub authentication state using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GitHubUser, AuthState } from '@/types';

interface AuthStore extends AuthState {
  // Actions
  setAuthenticated: (user: GitHubUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Device Flow state
  deviceFlowState: {
    isActive: boolean;
    userCode: string | null;
    verificationUri: string | null;
    status: string;
  };
  startDeviceFlow: () => void;
  setDeviceFlowCode: (userCode: string, verificationUri: string) => void;
  setDeviceFlowStatus: (status: string) => void;
  endDeviceFlow: () => void;

  // Loading state
  isLoading: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,

      deviceFlowState: {
        isActive: false,
        userCode: null,
        verificationUri: null,
        status: '',
      },

      // Actions
      setAuthenticated: (user, token) =>
        set({
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      // Device Flow actions
      startDeviceFlow: () =>
        set({
          deviceFlowState: {
            isActive: true,
            userCode: null,
            verificationUri: null,
            status: 'Starting authentication...',
          },
          isLoading: true,
        }),

      setDeviceFlowCode: (userCode, verificationUri) =>
        set((state) => ({
          deviceFlowState: {
            ...state.deviceFlowState,
            userCode,
            verificationUri,
            status: 'Enter the code in your browser',
          },
        })),

      setDeviceFlowStatus: (status) =>
        set((state) => ({
          deviceFlowState: {
            ...state.deviceFlowState,
            status,
          },
        })),

      endDeviceFlow: () =>
        set({
          deviceFlowState: {
            isActive: false,
            userCode: null,
            verificationUri: null,
            status: '',
          },
          isLoading: false,
        }),
    }),
    {
      name: 'vanilla-claude-code-auth',
      // Only persist these fields
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
