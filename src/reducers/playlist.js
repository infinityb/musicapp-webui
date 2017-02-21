// @flow

import {
  PLAYLIST_ENQUEUE_LAST,
  PLAYLIST_ENQUEUE_NEXT,
  PLAYLIST_HISTORY_MAX,
  PLAYLIST_UPCOMING_DEFAULT,
  // PLAYLIST_REMOVE_IDX,
} from 'constants/actionTypes';

import type { PlaylistState, PlaylistAction } from 'types/playlist';

function _fixup_index(state: PlaylistState): PlaylistState {
  if (state._cur_playing <= PLAYLIST_HISTORY_MAX) {
      // fast-path - no change required
      return state;
  }
  let out = {};
  out._queue = state._queue.slice(state._cur_playing - PLAYLIST_HISTORY_MAX);
  out._cur_playing = PLAYLIST_HISTORY_MAX;
  out._txid = state._txid;
  return out;
}

export function add_next(state: PlaylistState, song: siteapi.Song): PlaylistState {
  let out = playlist_init_state();
  out._queue.push(...state._queue.slice(0, state._cur_playing));
  out._queue.push({txid: state._txid, song: song});
  out._queue.push(...state._queue.slice(state._cur_playing));
  out._cur_playing = state._cur_playing;
  out._txid = state._txid + 1;
  return _fixup_index(out);
}

export function remove_at(state: PlaylistState, index: number): PlaylistState {
  let out = playlist_init_state();
  out._queue.push(...state._queue.slice(0, index));
  out._queue.push(...state._queue.slice(index + 1));
  out._txid = state._txid;
  if (index >= state._cur_playing) {
    state._cur_playing -= 1;
  }
  return out;
}


export function add_last(state: PlaylistState, song: siteapi.Song): PlaylistState {
  let out = playlist_init_state();
  out._queue = state._queue.slice();
  out._queue.push({txid: state._txid, song: song});
  out._txid = state._txid + 1;
  return _fixup_index(out);
}

export function playlist_init_state(): PlaylistState {
  return {
    _txid: 0,
    _queue: [],
    _cur_playing: 0,
  };
}

export default (state: PlaylistState = playlist_init_state(),  action: Action) => {
  switch (action.type) {
    case PLAYLIST_ENQUEUE_LAST:
      return add_last(state, action.song);
    case PLAYLIST_ENQUEUE_NEXT:
      return add_next(state, action.song);
    // case PLAYLIST_REMOVE_IDX:
    //  return remove_at(state, action.index);
    default:
      return state;
  }
};
