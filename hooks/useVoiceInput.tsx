'use client';

import { useState, useCallback, useEffect } from 'react';

// Extend Window interface for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export function useVoiceInput(onResult: (text: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsSupported(
            typeof window !== 'undefined' &&
            (!!window.webkitSpeechRecognition || !!window.SpeechRecognition)
        );
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('お使いのブラウザは音声入力に対応していません。');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'ja-JP';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setError('音声認識エラーが発生しました');
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [isSupported, onResult]);

    return { isListening, isSupported, startListening, error };
}
