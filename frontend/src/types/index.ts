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