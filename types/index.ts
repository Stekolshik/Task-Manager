export type TaskStatus = 'New' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Location {
    address: string;
    latitude?: number;
    longitude?: number;
}

export interface Attachment {
    id: string;
    uri: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    location: Location;
    attachments: Attachment[];
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
    syncStatus: 'synced' | 'pending' | 'failed';
}

export interface HistoryItem {
    id: string;
    taskId: string;
    action: 'created' | 'updated' | 'status_changed' | 'attachment_added' | 'attachment_removed' | 'deleted' | 'synced';
    description: string;
    timestamp: string;
    details?: any;
}