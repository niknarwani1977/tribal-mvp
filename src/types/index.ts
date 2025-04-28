export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  homeLocation?: string;
}

export interface TrustedCircle {
  id: string;
  name: string;
  members: User[];
  pendingInvites: string[];
}

export interface Event {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  assignedMembers: string[];
  circleId: string;
}

export interface Notification {
  id: string;
  type: 'event_request' | 'event_response' | 'traffic_alert';
  message: string;
  read: boolean;
  createdAt: string;
}