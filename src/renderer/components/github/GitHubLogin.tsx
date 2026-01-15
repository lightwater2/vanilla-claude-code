/**
 * GitHub Login Component
 *
 * Handles GitHub OAuth Device Flow authentication UI
 */

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/renderer/stores/authStore';
import styles from './GitHubLogin.module.css';

interface GitHubLoginProps {
  onClose?: () => void;
}

export function GitHubLogin({ onClose }: GitHubLoginProps) {
  const {
    deviceFlowState,
    startDeviceFlow,
    setDeviceFlowCode,
    setDeviceFlowStatus,
    endDeviceFlow,
    setAuthenticated,
  } = useAuthStore();

  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    setError(null);
    startDeviceFlow();

    try {
      // In a real implementation, this would call the main process via IPC
      // For now, we simulate the device flow

      // Simulate requesting device code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show mock user code
      setDeviceFlowCode('ABCD-1234', 'https://github.com/login/device');

      // Simulate polling (in real app, this continues until user authorizes)
      setDeviceFlowStatus('Open the link and enter the code');

      // Note: In production, you would:
      // 1. Call window.electronAPI.startDeviceAuth()
      // 2. Open the verification URL
      // 3. Poll for access token
      // 4. Call setAuthenticated() with the result

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      endDeviceFlow();
    }
  }, [startDeviceFlow, setDeviceFlowCode, setDeviceFlowStatus, endDeviceFlow]);

  const handleOpenUrl = useCallback(() => {
    if (deviceFlowState.verificationUri) {
      // In real app: window.electronAPI.openExternal(verificationUri)
      window.open(deviceFlowState.verificationUri, '_blank');
    }
  }, [deviceFlowState.verificationUri]);

  const handleCancel = useCallback(() => {
    endDeviceFlow();
    onClose?.();
  }, [endDeviceFlow, onClose]);

  const handleCopyCode = useCallback(() => {
    if (deviceFlowState.userCode) {
      navigator.clipboard.writeText(deviceFlowState.userCode);
    }
  }, [deviceFlowState.userCode]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Connect GitHub</h2>
          <button className={styles.closeButton} onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {!deviceFlowState.isActive ? (
            <>
              <div className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <p className={styles.description}>
                Connect your GitHub account to access repositories, manage pull requests, and sync your code.
              </p>
              <button className={styles.loginButton} onClick={handleLogin}>
                Sign in with GitHub
              </button>
            </>
          ) : (
            <>
              <div className={styles.deviceFlow}>
                <p className={styles.status}>{deviceFlowState.status}</p>

                {deviceFlowState.userCode && (
                  <>
                    <div className={styles.codeContainer}>
                      <span className={styles.codeLabel}>Your code:</span>
                      <div className={styles.code}>
                        {deviceFlowState.userCode}
                        <button
                          className={styles.copyButton}
                          onClick={handleCopyCode}
                          title="Copy code"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    <button
                      className={styles.openButton}
                      onClick={handleOpenUrl}
                    >
                      Open GitHub
                    </button>

                    <p className={styles.hint}>
                      Enter the code above at github.com/login/device
                    </p>
                  </>
                )}

                {!deviceFlowState.userCode && (
                  <div className={styles.spinner}>
                    <div className={styles.spinnerRing} />
                  </div>
                )}
              </div>

              <button className={styles.cancelButton} onClick={handleCancel}>
                Cancel
              </button>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default GitHubLogin;
