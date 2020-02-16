export interface Todo {
    id: string;
    value: string;
    timeAdded: string;
    checked: boolean;
    syncState: SyncState,
    fireRef?: string
}

export enum SyncState {
    Uploaded, Pending, Failed
}