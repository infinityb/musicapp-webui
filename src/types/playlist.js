export type PlaylistState = {
}

export type PlaylistAction = 
  { type: 'PLAYLIST-QUEUE-ADD-LAST', song: Song }
  | { type: 'PLAYLIST-QUEUE-ADD-NEXT', song: Song }
  | { type: 'PLAYLIST-QUEUE-JUMP-TO', index: number }
  | { type: 'PLAYLIST-QUEUE-REMOVE', index: number }
  | { type: 'PLAYLIST-QUEUE-NOOP' };