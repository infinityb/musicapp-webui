// @flow

import { connect } from 'react-redux';
import * as actions from 'actions/playlist';
// import * as state from 
import { Player } from 'components/Player';
import type { PlaylistState, PlaylistAction } from 'types/playlist';

const mapStateToProps = (state: PlaylistState) => {
  return {'queue': state.playlist};
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onQueueAddNext: (event) => {
    return dispatch(actions.queue_add_next(event.song));
  },
  onQueueAddLast: (event) => {
    return dispatch(actions.queue_add_last(event.song));
  },
  onOpenAlbum: (event) => {
    return dispatch(actions.noop());
  },
  onQueueJumpTo: (event) => {
    console.log("onQueueJumpTo", event.index);
    return dispatch(actions.queue_jump_to(event.index));
  },
  onQueueJumpPrev: (event) => {
    console.log("onQueueJumpPrev");
    return dispatch(actions.decrement_index());
  },
  onQueueJumpNext: (event) => {
    console.log("onQueueJumpNext");
    return dispatch(actions.increment_index());
  },
  onQueueRemove: (event) => {
    console.log("onQueueRemove", event.index);
    return dispatch(actions.queue_remove(event.index));
  },
  onSongFinish: (event) => {
    console.log("onSongFinish");
    return dispatch(actions.increment_index());
  }
});

const ContainedPlayer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Player);

export default ContainedPlayer;
