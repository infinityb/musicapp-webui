// @flow

// anything older will be pruned
export const PLAYLIST_HISTORY_MAX = 10;

// used during automatic population
export const PLAYLIST_UPCOMING_DEFAULT = 25;

export const PLAYLIST_QUEUE_ADD_LAST = 'PLAYLIST-QUEUE-ADD-LAST';
export const PLAYLIST_QUEUE_ADD_NEXT = 'PLAYLIST-QUEUE-ADD-NEXT';
export const PLAYLIST_QUEUE_JUMP_TO = 'PLAYLIST-QUEUE-JUMP-TO';
export const PLAYLIST_QUEUE_REMOVE = 'PLAYLIST-QUEUE-REMOVE';
export const PLAYLIST_QUEUE_NOOP = 'PLAYLIST-QUEUE-NOOP';
export const PLAYLIST_MOVE_NEXT = 'PLAYLIST-MOVE-NEXT'