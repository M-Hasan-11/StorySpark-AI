
export interface StoryPage {
  id: number;
  text: string;
  imageUrl?: string;
  audioData?: string;
}

export enum GameState {
  IDLE,
  LOADING_STORY,
  PLAYING,
  ERROR
}
