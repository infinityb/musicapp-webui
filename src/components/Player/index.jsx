// @flow

import React from 'react';
import { SongsAllRequest, SongSearchResponse } from './../../siteapi';

export default class Player extends React.Component {
  constructor() {
    super();
    this.state = new SongSearchResponse();
    this.player = window.player = (function() {
        var return_value = {};

        function Player() {
          this._context = new AudioContext();
          this._playing = false;
        }

        Player.prototype = new Object();
        Player.prototype.constructor = Player;

        Player.prototype._start_immediate = function(buffer) {
          let that = this;
          var source = this._context.createBufferSource();
          source.buffer = abuf;
          source.connect(this._context.destination);
          source.onended = function() {
            that._track_finished();
          }
          source.start(0);
        }

        // Called when this player has finished playing a source
        Player.prototype._track_finished = function() {
          console.log("_track_finished");
          if (this._queue.length > 0) {
            this._start_immediate(this._queue[0]);
            this._queue = this._queue.slice(1);
          } else {
            this._playing = false;
          }
        }

        Player.prototype.enqueue = function(buffer) {
          let that = this;
          if (!this._playing) {
            this._start_immediate(buffer);
          } else {
            this._queue.push(buffer);
          }
        }

        function doHttpReq(method, url, xhrConfig) {
          let xhr = new XMLHttpRequest();
          xhr.responseType = "arraybuffer";
          
          if (xhrConfig !== undefined) {
            xhrConfig(xhr);
          }

          return new Promise(function(resolve, reject) {
            xhr.onreadystatechange = function(evt) {
              if (this.readyState == XMLHttpRequest.DONE) {
                if (this.status == 200) {
                  resolve(xhr.response);
                } else {
                  reject(xhr)
                }
              }
            };
            xhr.open(method, url, true);
            xhr.setRequestHeader("Authorization", "bearer " + window.localStorage['auth_token']);
            xhr.send();
          });
        }

        function trackGetter(context) {
          return function getTrack(url) {
            return doHttpReq("GET", url)
              .then(function(buf) {
                return context.decodeAudioData(buf);
              });
          }
        }

        var context = new AudioContext();
        return_value['context'] = context;
        var player = trackGetter(context);

        return_value['playblob'] = function(bid) {
          player("http://music.yshi.org:8001/blob/" + bid).then(function(abuf) {
            return new Promise(function(resolve, reject) {
              var source = context.createBufferSource();
              source.buffer = abuf;
              source.connect(context.destination);
              
              return_value['source'] = source;
              source.onended = function(evt) {
                console.log("source ended");
                resolve();
              }
              source.start(0);
            });
          }).then(function() {
            console.log("exit");
          }).catch(function(err) {
            console.log("error", err);
          })
        };

        return return_value;
      }());
    // this.songPlay = this.songPlay.bind(this);
  }

  componentDidMount() {
    let _this = this;
    let req = new SongsAllRequest();
    req.execute().then(function(res) {
      _this.setState(res);
    }).catch(function(err) {
      console.log("err =", err);
    });
  };

  componentWillUnmount() {
    console.log("TODO: abort");
  };

  onItemClick(song, event) {
    console.log("play", song, event.currentTarget.dataset.id);
    this.player.playblob(song._blob);
    this.setState({ selectedItem: event.currentTarget.dataset.id });
    //where 'id' =  whatever suffix you give the data-* li attribute
  };

  render() {
    let that = this;
    window.__xx = this;
    console.log("state = ", this, this.state);
    let clickHandler = this.onItemClick.bind(this);
    return (
      <div>
        <h1>Player!</h1>
        {this.state.results.map(function(song) {
          return (
            <div key={song.id} className="song">
              <button data-id={song.id} onClick={clickHandler.bind(null, song)}>
                Play
              </button>
              <span>{song.title()}</span>
              &nbsp;by&nbsp;
              <span>{song.artist()}</span>
              &nbsp;on&nbsp;
              <span>{song.album()}</span>
            </div>
          );
        }, this)}
      </div>
    );
  }
}
