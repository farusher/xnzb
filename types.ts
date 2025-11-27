export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  location?: string; // e.g., "北京"
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  type: 'chat' | 'join' | 'like' | 'gift';
  giftName?: string;
  giftIcon?: string;
}

export interface StreamSettings {
  viewerCount: number;
  likeCount: number;
  hostName: string;
  hostAvatar: string; // URL or base64
  filterType: 'none' | 'warm' | 'cool' | 'soft' | 'bw';
}

export interface InteractionConfig {
  autoLikeRate: number; // Likes per second
  autoCommentRate: number; // Comments per second
  autoGiftRate: number; // Gifts per minute
}
