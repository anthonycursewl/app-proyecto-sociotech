export interface NotificationItem {
  id: string;
  eventType: string;
  subject: string;
  body: string | null;
  status: string;
  recipientName: string | null;
  recipientEmail: string;
  sentAt: string | null;
  createdAt: string;
  errorMessage: string | null;
}

export interface PaginatedNotificationsResponse {
  data: NotificationItem[];
  nextCursor: string | null;
}
