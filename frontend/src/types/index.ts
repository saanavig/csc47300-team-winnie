 // Shared types
 // Central source of truth for Album and Photo interfaces used across components.
 // Keep id as string to avoid type mismatches between components.


 export interface Album {
    id: string;
    name: string;
    coverPhoto?: string;
    photoCount: number;
    privacy: 'private' | 'shared' | 'public';
    createdAt: string;
    sharedWith?: string[]; // User IDs for shared albums
}

export interface Photo {
    id: string;
    url: string;
    tags: string[];
    uploadDate: string;
    albumId?: string;
}