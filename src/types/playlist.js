export type PlaylistState = {
  _queue: Array<Song>,
  _playing_index: number,
}

export type PlaylistAction = 
  { type: "set-playing", where: number }
  | { type: "enqueue-last", value: Song }
  | { type: "enqueue-next", value: Song };
