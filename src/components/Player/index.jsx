// @flow

import React from 'react';
import * as siteapi from './../../siteapi';
import { SongsAllRequest, SongSearchResponse } from 'siteapi';
import {
  PLAYLIST_HISTORY_MAX,
  PLAYLIST_ENQUEUE_NEXT,
  PLAYLIST_ENQUEUE_LAST,
} from "./../../constants/actionTypes";
import {add_next, add_last, remove_at, playlist_init_state, increment_index} from "reducers/playlist";

import Search from "./search";
import s from './styles.scss';

export class Song extends React.Component {
  render() {
    let __song__ = this.props['song'];

    let play = function() {
      this.props.onPlay({
        'target': this,
        'song': __song__,
      });
    }.bind(this);

    let enqueueNext = function() {
      this.props.onEnqueueNext({
        'target': this,
        'song': __song__,
      });
    }.bind(this);

    let enqueueLast = function() {
      this.props.onEnqueueLast({
        'target': this,
        'song': __song__,
      });
    }.bind(this);

    let openAlbum = function() {
      this.props.onOpenAlbum({
        'target': this,
        'song': __song__,
      });
    }.bind(this);

    return (
      // wtf is `key=...`? some React thing?
      <tr key={__song__.id} data-id={__song__.id}>
        <td data-col="title">
          <button aria-label="Play" data-id="play" onClick={play} >
            &#x25b6;
          </button>
          <button aria-label="Play Next" onClick={enqueueNext} >
            Play Next
          </button>
          <button aria-label="Enqueue" onClick={enqueueLast} >
            Enqueue
          </button>
          <button aria-label="Album" onClick={openAlbum} >
            Show Album
          </button>
          <span>
            <img src="" alt=""/>
            {__song__.title("")}
          </span>
        </td>
        <td data-col="duration"><span>{__song__.duration()}</span></td>
        <td data-col="artist" data-artist-name={__song__.artist("")}>
          <span className="column-content tooltip">
            <a aria-label={"Artist: " + __song__.artist("")}>
              {__song__.artist("")}
            </a>
          </span>
        </td>
        <td data-col="album" data-album-id={__song__._album.id}>
          <span>
            <a aria-label={"Album: " + __song__.album("")}>
              {__song__.album("")}
            </a>
          </span>
        </td>
      </tr>
    );
  }
}

Song.propTypes = {
  song: React.PropTypes.instanceOf(siteapi.Song),
  onPlay: React.PropTypes.func.isRequired,
  onEnqueueLast: React.PropTypes.func.isRequired,
  onEnqueueNext: React.PropTypes.func.isRequired,
  onOpenAlbum: React.PropTypes.func.isRequired,
};

export class QueueEntry extends React.Component {
  rootClassNames() {
    let names = [];
    if (this.props.playing) {
      names.push(s.playing)
    }
    return names.join(' ');
  }

  render() {
    // wtf is `key=...`? some React thing?
    let __song__ = this.props['song'];

    let removeItem = function() {
      this.props.onRemoveItem({
        'target': this,
        'index': this.props.index,
        'song': __song__,
      });
    }.bind(this);
    let enqueueNext = function() {
      this.props.onEnqueueNext({
        'target': this,
        'song': __song__,
      });
    }.bind(this);
    let jumpTo = function() {
      this.props.onJumpTo({
        'target': this,
        'index': this.props.index,
        'song': __song__,
      });
    }.bind(this);
    
    return (
      <tr key={__song__.id} className={this.rootClassNames()} data-index={this.props.index} data-id={__song__.id}>
        <button aria-label="Remove" data-id="play" onClick={removeItem} >
          Remove
        </button>
        <button aria-label="Play Next" onClick={enqueueNext} >
          Play Next
        </button>
        <button aria-label="Jump To" onClick={jumpTo} >
          Jump To
        </button>
        <td data-col="title">
          <span>
            <img src="" alt=""/>
            {__song__.title("")}
          </span>
        </td>
        <td data-col="duration"><span>{__song__.duration()}</span></td>
        <td data-col="artist" data-artist-name={__song__.artist("")}>
          <span className="column-content tooltip">
            <a aria-label={"Artist: " + __song__.artist("")}>
              {__song__.artist("")}
            </a>
          </span>
        </td>
        <td data-col="album" data-album-id={__song__._album.id}>
          <span>
            <a aria-label={"Album: " + __song__.album("")}>
              {__song__.album("")}
            </a>
          </span>
        </td>
      </tr>
    );
  }
}

QueueEntry.propTypes = {
  song: React.PropTypes.instanceOf(siteapi.Song),
  index: React.PropTypes.number.isRequired,
  onRemoveItem: React.PropTypes.func.isRequired,
  onEnqueueNext: React.PropTypes.func.isRequired,
  onJumpTo: React.PropTypes.func.isRequired,
};

class PlayManager {
  txid: number;
  player: ?HTMLAudioElement;
  current: any;
  _onended: any;

  constructor() {
    this.txid = -1;
    this.player = undefined; // document.createElement('audio');
    this.current = undefined;
    this._onended = undefined;
  }

  notify() {
    if (this.player != null) {
      let player: HTMLAudioElement = this.player;
      if (this.current == null) { 
        // current was set to undefined - cease playing.
        player.pause();
        this.player = undefined;
        return;
      }
    }

    if (this.player != null) {
      let player: HTMLAudioElement = this.player;
      if (this.txid != this.current.queue_txid) {
        player.pause();
        this.player = undefined
      }
    }

    if (this.txid == this.current.queue_txid) {
      // no change - continue playing normally.
      return;
    }


    if (this.player == null) {
      this.player = document.createElement('audio');
    }
    let player: HTMLAudioElement = this.player;

    this.txid = this.current.queue_txid;
    let src = document.createElement('source');
    src.setAttribute('src', "http://music.yshi.org:8001/blob/" + this.current.song._blob);
    player.appendChild(src);
    player.onended = function() {
      if (this._onended !== undefined) {
        this._onended();
      }
    }.bind(this);
    player.play();
  }
}

export class Player extends React.Component {
  state: any;
  _play_manager: PlayManager;

  constructor() {
    super();
    this.state = {};
    this.state.songs = new SongSearchResponse();
    this.state.queue = playlist_init_state();
    this._play_manager = new PlayManager();
    this._play_manager._onended = this.onSongFinish.bind(this);
  }

  onSongFinish() {
    let next_queue = increment_index(this.state.queue);
    this.syncPlayerState(next_queue);
    this.setState({'queue': next_queue});
  }

  componentDidMount() {
    let _this = this;
    let req = new SongsAllRequest();
    req.execute().then(function(res) {
      console.log("res=", res);
      _this.setState({'songs': res});
    }).catch(function(err) {
      console.log("err =", err);
    });
  };

  componentWillUnmount() {
    console.log("TODO: abort");
  };

  playSong(event: any) {
    console.log("TODO playSong", event);
  }
  enqueueNext(event: any) {
    let next_queue = add_next(this.state.queue, event.song);
    this.syncPlayerState(next_queue);
    this.setState({'queue': next_queue});
  }
  enqueueLast(event: any) {
    let next_queue = add_last(this.state.queue, event.song);
    this.syncPlayerState(next_queue);
    this.setState({'queue': next_queue});
  }
  openAlbum(event: any) {
    console.log("TODO openAlbum", event);
  }
  queueRemove(event: any) {
    let next_queue = remove_at(this.state.queue, event.index);
    this.syncPlayerState(next_queue);
    this.setState({'queue': next_queue});
  }
  queueJumpTo(event: any) {
    console.log("TODO queueJumpTo", event);
    // this.syncPlayerState(next_queue);
  }
  syncPlayerState(queue: any) {
    console.log("aaa", queue._queue, queue._cur_playing);
    this._play_manager.current = queue._queue[queue._cur_playing];
    this._play_manager.notify();
  }

  render() {
    let that = this;
    window.__xx = this;
    return (
      <div>
        <h1>Queue</h1>
        <table>
          <thead>
            <tr></tr>
          </thead>
          <tbody>
            {this.state.queue._queue.map(function(entry, idx) {
              return (
                <QueueEntry
                  song={entry.song}
                  index={idx}
                  onRemoveItem={this.queueRemove.bind(this)}
                  onEnqueueNext={this.enqueueNext.bind(this)}
                  onJumpTo={this.queueJumpTo.bind(this)}
                  playing={idx == this.state.queue._cur_playing}
                  />
              );
            }, this)}
          </tbody>
        </table>
        <h1>Songs</h1>
        <table>
          <thead>
            <tr></tr>
          </thead>
          <tbody>
            {this.state.songs.results.map(function(song, idx) {
              return (
                <Song
                  song={song}
                  onPlay={this.playSong}
                  onEnqueueNext={this.enqueueNext.bind(this)}
                  onEnqueueLast={this.enqueueLast.bind(this)}
                  onOpenAlbum={this.openAlbum.bind(this)}
                  />
              );
            }, this)}
          </tbody>
        </table>
      </div>
    );
  }
};

// Player.propTypes = {
//   songs: React.PropTypes.arrayOf(siteapi.Song),
//   onIncrementClick: React.PropTypes.func.isRequired,
//   onDecrementClick: React.PropTypes.func.isRequired,
// };
