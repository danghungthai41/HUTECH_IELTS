"use client";

import { useState, useRef, useCallback } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: any) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
  }
}

export function useSpeech() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async (onTranscript?: (t: string) => void) => {
    setError("");
    setTranscript("");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.start();
    } catch {
      setError("Không thể truy cập microphone.");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Trình duyệt không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    let finalText = "";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
          break;
        } else {
          interim = event.results[i][0].transcript;
        }
      }
      const combined = finalText + interim;
      setTranscript(combined);
      onTranscript?.(combined);
    };

    recognition.onerror = () => setError("Lỗi nhận dạng giọng nói.");
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      recognitionRef.current?.stop();
      setIsRecording(false);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          // Stop all tracks
          mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
      }
    });
  }, []);

  return { isRecording, transcript, error, startRecording, stopRecording, setTranscript };
}
