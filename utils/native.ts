import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNative = Capacitor.isNativePlatform();

export const setupNativeEnvironment = async () => {
    if (!isNative) return;

    try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0f172a' });

        // Listen for keyboard events to handle safe areas manually if needed
        Keyboard.addListener('keyboardWillShow', info => {
            document.body.classList.add('keyboard-is-open');
        });

        Keyboard.addListener('keyboardWillHide', () => {
            document.body.classList.remove('keyboard-is-open');
        });
    } catch (e) {
        console.warn('Native environment setup failed:', e);
    }
};
