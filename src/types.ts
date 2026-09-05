export type Role = 'man' | 'woman' | 'wali';

export const TIMELINES = ['Within 6 months', '6-12 months', '1-2 years', 'Exploring'] as const;
export type Timeline = (typeof TIMELINES)[number];

export interface Profile {
  id: string;
  role: 'man' | 'woman';
  name: string;
  age: number;
  location: string;
  education: string;
  career: string;
  timeline: Timeline;
  about: string;
  waliId?: string; // women only — profile is inactive without it
}

export interface Wali {
  id: string;
  name: string;
  relationship: string;
  contact: string;
  wardId: string;
}

/**
 * Request lifecycle. The wali gates first, then the woman consents.
 * Her consent is a condition of the marriage in fiqh — the wali facilitates,
 * he does not decide for her. Both gates are required to open a chat.
 */
export type RequestStatus =
  | 'pending_wali'
  | 'declined_wali'
  | 'pending_woman'
  | 'declined_woman'
  | 'accepted';

export interface MatchRequest {
  id: string;
  manId: string;
  womanId: string;
  waliId: string;
  status: RequestStatus;
  note: string;
  createdAt: number;
}

export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  text: string;
  at: number;
  system?: boolean;
}

export interface MeetIntent {
  requestId: string;
  initiatedBy: string;
  confirmedBy?: string;
}

/** Who the demo is currently acting as. */
export interface Actor {
  role: Role;
  id: string;
}
