"use client";

import { useCallback, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import {
  extractEmergencyFlags,
  inferLanguageFromGreeting,
} from "@/lib/intake-voice-config";

export type VoiceIntakeStatus =
  | "idle"
  | "requesting-permission"
  | "connecting"
  | "listening"
  | "speaking"
  | "complete"
  | "error";

export type VoiceDialogueTurn = {
  role: "patient" | "agent";
  text: string;
};

export type VoiceIntakeResult = {
  transcript: string;
  language?: string;
  emergencyFlags: string[];
  chiefComplaint?: string;
  dialogue: VoiceDialogueTurn[];
  sessionId?: string;
};

export function useVoiceIntake() {
  const [status, setStatusState] = useState<VoiceIntakeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [dialogue, setDialogue] = useState<VoiceDialogueTurn[]>([]);
  const [language, setLanguage] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>();

  const statusRef = useRef<VoiceIntakeStatus>("idle");
  const transcriptRef = useRef("");
  const dialogueRef = useRef<VoiceDialogueTurn[]>([]);
  const languageRef = useRef<string | undefined>(undefined);
  const sessionIdRef = useRef<string | undefined>(undefined);

  const setStatus = useCallback((next: VoiceIntakeStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const clearConversation = useCallback(() => {
    transcriptRef.current = "";
    dialogueRef.current = [];
    languageRef.current = undefined;
    sessionIdRef.current = undefined;
    setTranscript("");
    setDialogue([]);
    setLanguage(undefined);
    setSessionId(undefined);
    setError(null);
  }, []);

  const appendTurn = useCallback((turn: VoiceDialogueTurn) => {
    const previous = dialogueRef.current.at(-1);

    if (previous?.role === turn.role && previous.text === turn.text) {
      return;
    }

    const nextDialogue = [...dialogueRef.current, turn];
    dialogueRef.current = nextDialogue;
    setDialogue(nextDialogue);

    if (turn.role !== "patient") {
      return;
    }

    const nextTranscript = [transcriptRef.current, turn.text]
      .filter(Boolean)
      .join("\n");
    const nextLanguage =
      languageRef.current ?? inferLanguageFromGreeting(nextTranscript);

    transcriptRef.current = nextTranscript;
    languageRef.current = nextLanguage;
    setTranscript(nextTranscript);
    setLanguage(nextLanguage);
  }, []);

  const getResult = useCallback((): VoiceIntakeResult => {
    const transcriptValue = transcriptRef.current;

    return {
      transcript: transcriptValue,
      language: languageRef.current,
      emergencyFlags: extractEmergencyFlags(transcriptValue),
      chiefComplaint: getFirstLine(transcriptValue),
      dialogue: dialogueRef.current,
      sessionId: sessionIdRef.current,
    };
  }, []);

  const conversation = useConversation({
    onConnect: () => setStatus("listening"),
    onDisconnect: () => {
      setStatus(transcriptRef.current ? "complete" : "idle");
    },
    onError: (nextError: unknown) => {
      setError(readErrorMessage(nextError));
      setStatus("error");
    },
    onModeChange: (mode: unknown) => {
      const nextMode = readMode(mode);

      if (nextMode === "speaking" || nextMode === "listening") {
        setStatus(nextMode);
      }
    },
    onMessage: (message: unknown) => {
      const turn = readDialogueTurn(message);

      if (turn) {
        appendTurn(turn);
      }
    },
    onStatusChange: (nextStatus: unknown) => {
      if (readStatus(nextStatus) === "connecting") {
        setStatus("connecting");
      }
    },
  });

  const start = useCallback(async () => {
    clearConversation();
    setStatus("requesting-permission");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("connecting");

      const signedUrl = await getSignedUrl();
      const nextSessionId = await conversation.startSession({ signedUrl });

      if (typeof nextSessionId === "string") {
        sessionIdRef.current = nextSessionId;
        setSessionId(nextSessionId);
      }
    } catch (nextError) {
      setError(readErrorMessage(nextError));
      setStatus("error");
    }
  }, [clearConversation, conversation, setStatus]);

  const finish = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch {
      // The session may already be closed by the agent's end-call tool.
    }

    setStatus("complete");
    return getResult();
  }, [conversation, getResult, setStatus]);

  const reset = useCallback(() => {
    try {
      conversation.endSession();
    } catch {
      // The session may already be closed by the agent's end-call tool.
    }

    clearConversation();
    setStatus("idle");
  }, [clearConversation, conversation, setStatus]);

  return {
    status,
    error,
    transcript,
    dialogue,
    language,
    sessionId,
    emergencyFlags: extractEmergencyFlags(transcript),
    start,
    finish,
    reset,
    getResult,
  };
}

async function getSignedUrl() {
  const response = await fetch("/api/elevenlabs/session", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to start the voice session.");
  }

  const data = (await response.json()) as { signedUrl?: unknown };

  if (typeof data.signedUrl !== "string") {
    throw new Error("The voice session response was invalid.");
  }

  return data.signedUrl;
}

function getFirstLine(value: string) {
  return value.split("\n").find(Boolean);
}

function readDialogueTurn(message: unknown): VoiceDialogueTurn | null {
  const record = asRecord(message);
  if (!record) return null;

  // @elevenlabs/client delivers MessagePayload: { message, source: "user" | "ai", role }
  const text = readString(record.message);
  if (!text) return null;

  const source = readString(record.source) ?? readString(record.role);
  if (source === "user" || source === "patient") {
    return { role: "patient", text };
  }
  if (source === "ai" || source === "agent" || source === "assistant") {
    return { role: "agent", text };
  }

  return null;
}

function readMode(value: unknown) {
  if (value === "speaking" || value === "listening") {
    return value;
  }

  const record = asRecord(value);
  const mode = record ? readString(record.mode) : undefined;

  return mode === "speaking" || mode === "listening" ? mode : undefined;
}

function readStatus(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  const record = asRecord(value);
  return record ? readString(record.status) : undefined;
}

function readErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Voice intake failed. Please try again.";
}

function asRecord(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
