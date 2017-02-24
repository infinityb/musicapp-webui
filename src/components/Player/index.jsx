// @flow

import React from 'react';
import * as siteapi from './../../siteapi';
import { SongsAllRequest, SongSearchResponse } from 'siteapi';
import {
  PLAYLIST_HISTORY_MAX,
  PLAYLIST_QUEUE_ADD_NEXT,
  PLAYLIST_QUEUE_ADD_LAST,
} from "./../../constants/actionTypes";
import {add_next, add_last, remove_at, playlist_init_state, increment_index} from "reducers/playlist";

import Search from "./search";
import s from './styles.scss';

function getMetaContentByName(name, content, defval) {
    var content = (content == null) ? 'content' : content;
    var node = document.querySelector("meta[name='"+name+"']");
    if (node == null) {
        return defval;
    }
    var val = node.getAttribute(content);
    if (val == null) {
        return defval;
    }
    return val;
}

export class Song extends React.Component {
  render() {
    let __song__ = this.props['song'];

    let enqueueNext = function() {
      this.props.onQueueAddNext({
        'target': this,
        'song': __song__,
      });
    }.bind(this);

    let enqueueLast = function() {
      this.props.onQueueAddLast({
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
  onQueueAddLast: React.PropTypes.func.isRequired,
  onQueueAddNext: React.PropTypes.func.isRequired,
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
    if (__song__ == undefined) {
      throw '__song__ is undefined';
    }

    let removeItem = function() {
      this.props.onRemoveItem({
        'target': this,
        'index': this.props.index,
        'song': __song__,
      });
    }.bind(this);
    let enqueueNext = function() {
      this.props.onQueueAddNext({
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
  onQueueAddNext: React.PropTypes.func.isRequired,
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
    if (this.current == null) {
      console.log("no current - bail");
      return;
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
    let blob_base = getMetaContentByName("yshi-musicapp-content", undefined, "");
    src.setAttribute('src', blob_base + "blob/" + this.current.song._blob);
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

  constructor(props) {
    super(props);
    this.state = {};
    this.state.songs = new SongSearchResponse();
    this.state.queue = playlist_init_state();
    this._play_manager = new PlayManager();
    this._play_manager._onended = this.props.onSongFinish.bind(this);
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
  componentDidUpdate() {
    console.log("this.props.queue = ", this.props.queue);
    this.syncPlayerState(this.props.queue);
  }
  playSong(event: any) {
    console.log("TODO playSong", event);
  }
  openAlbum(event: any) {
    console.log("TODO openAlbum", event);
  }
  syncPlayerState(queue: any) {
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
            {this.props.queue._queue.map(function(entry, idx) {
              return (
                <QueueEntry
                  song={entry.song}
                  index={idx}
                  onRemoveItem={this.props.onQueueRemove.bind(this)}
                  onQueueAddNext={this.props.onQueueAddNext.bind(this)}
                  onJumpTo={this.props.onQueueJumpTo.bind(this)}
                  playing={idx == this.props.queue._cur_playing}
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
                  onQueueAddNext={this.props.onQueueAddNext.bind(this)}
                  onQueueAddLast={this.props.onQueueAddLast.bind(this)}
                  onOpenAlbum={this.props.onOpenAlbum.bind(this)}
                  />
              );
            }, this)}
          </tbody>
        </table>
      </div>
    );
  }
};

Player.propTypes = {
  // songs: React.PropTypes.arrayOf(siteapi.Song),
  onQueueAddNext: React.PropTypes.func.isRequired,
  onQueueAddLast: React.PropTypes.func.isRequired,
  onQueueJumpTo: React.PropTypes.func.isRequired,
  onQueueRemove: React.PropTypes.func.isRequired,
  onOpenAlbum: React.PropTypes.func.isRequired,
};
