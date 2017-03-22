// @flow

class Unimplemented {
    //
}

class KeyError {
    //
}

export class jQueryExecutor {
    //
}

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

export class LoginRequest {
    fap: string;
    faat: string;

    constructor(fap: string, faat: string) {
        this.fap = fap;
        this.faat = faat;
    }

    run(runner: any): Promise<LoginResponse> {
        // raises {AuthError}
        return new Promise(function(resolve, reject) {
            reject(new Unimplemented());
        });
    }

    execute(): Promise<LoginResponse> {
        let that = this;
        let base = getMetaContentByName("yshi-musicapp-api", undefined, "");
        return new Promise(function(resolve, reject) {
            // let xhr = new XMLHttpRequest();

            // xhr.open();
            // xhr.setRequestHeader("Content-Type", "application/json");
            // xhr.onload = function(evt) {
            //     //
            // };
            // xhr.send(
            $.ajax(base + "login", {
                method: "POST",
                dataType: "json",
                data: JSON.stringify(that),
                contentType: "application/json",
            }).done(function (msg) {
                console.log("msg = ", msg);
                resolve(LoginResponse.fromDoc(msg));
            }).fail(function( jqXHR, textStatus ) {
                console.log("err = ", jqXHR);
                // enrich this.
                reject(jqXHR);
            });
        });
    }
}

export class LoginResponse {
    user_id: string;
    access_token: string;

    static fromDoc(doc): LoginResponse {
        let out = new LoginResponse();
        out.user_id = doc['user_id'];
        out.access_token = doc['access_token'];
        return out;
    }
}

export class LoginError {
    //
}

export class AuthError {
    //
}

export class SongSearch {
    q: string;

    constructor(query: string) {
        this.q = query;
    }

    run(runner: any): Promise<SongSearchResponse> {
        // raises {AuthError}
        return new Promise(function(resolve, reject) {
            reject(new Unimplemented());
        });
    }
}

export class SongsAllRequest {
    run(runner: any): Promise<SongSearchResponse> {
        // raises {AuthError}
        return new Promise(function(resolve, reject) {
            reject(new Unimplemented());
        });
    }

    execute(): Promise<SongSearchResponse> {
        let that = this;
        let base = getMetaContentByName("yshi-musicapp-api", undefined, "");
        return new Promise(function(resolve, reject) {
            $.ajax(base + "songs", {
                method: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "bearer " + window.localStorage['auth_token']
                },
            }).done(function (msg) {
                try {
                    resolve(SongSearchResponse.fromDoc(msg));
                } catch (e) {
                    reject(e);
                }
            }).fail(function( jqXHR, textStatus ) {
                console.log("err: ", textStatus, "$$", jqXHR);
                // enrich this.
                reject(jqXHR);
            });
        });
    }
}

export class SongSearchResponse {
    results: Array<Song>; // deprecated
    _links: Map<String, any>;
    _items: Array<String>;
    _embedded: Map<String, any>;

    constructor() {
        this._links = new Map();
        this._items = [];
        this.results = this._items;
        this._embedded = new Map();
    }

    static fromDoc(doc): SongSearchResponse {
        let out = new SongSearchResponse();
        for (let x of doc['results']) {
            let song = new Song();
            song.id = x['id'];
            song.key = "song" + x['id'];
            song._album = new Promise(function(resolve, reject) {
                let album = new Album();
                album.id = x['album']['id'];
                album._art_blob = x['album']['art_blob'];
                album._metadata = x['album']['metadata'];
                resolve(album);
            });

            song._blob = x['blob'];
            song._art_blob = x['album']['art_blob'];
            song._length_ms = x['length_ms'];
            song._track_no = x['track_no'];
            song._metadata = {};
            for (var k in x['album']['metadata']) {
                song._metadata[k.toLowerCase()] = x['album']['metadata'][k];
            }
            for (var k in x['metadata']) {
                song._metadata[k.toLowerCase()] = x['metadata'][k];
            }
            out.results.push(song);
        }
        return out;
    }
}

export class AlbumGetResponse {
    songs: Array<Song>;

    static fromDoc(doc): AlbumGetResponse {
        let out = new AlbumGetResponse();
        for (let x of doc['songs']) {
            // out.songs.push(Song.fromDoc(x));
        }
        return out;
    }
}

export class AlbumGetRequest {
    run(runner: any): Promise<AlbumGetResponse> {
        // raises {AuthError}
        return new Promise(function(resolve, reject) {
            reject(new Unimplemented());
        });
    }

    execute(): Promise<AlbumGetResponse> {
        let that = this;
        let base = getMetaContentByName("yshi-musicapp-api", undefined, "");
        return new Promise(function(resolve, reject) {
            $.ajax(base + "songs ", {
                method: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "bearer " + window.localStorage['auth_token']
                },
            }).done(function (msg) {
                resolve(AlbumGetResponse.fromDoc(msg));
            }).fail(function( jqXHR, textStatus ) {
                console.log("err = ", jqXHR);
                // enrich this.
                reject(jqXHR);
            });
        });
    }
}

export class Song {
    id: number;
    key: string;
    _album: Promise<Album>;
    // _series: Promise<Series>;
    _blob: string;
    _art_blob: string;
    _length_ms: number;
    _track_no: number;
    _metadata: Map<string, string>;

    _getMetaField(field: string, defval: ?string = undefined): string {
        let value = this._metadata[field.toLowerCase()];
        if (value != null) {
            return value;
        }
        if (defval != null) {
            return defval;
        }
        throw new KeyError('key not found: ' + field);
    }

    title(defval:?string=undefined): string {
        return this._getMetaField("title", defval);
    }

    artist(defval:?string=undefined): string {
        return this._getMetaField("artist", defval);
    }

    album(defval:?string=undefined): string {
        return this._getMetaField("album", defval);
    }

    duration(): string {
        function tdur(s1) {
            var h1 = Math.floor(s1/(60 * 60));
            s1 %= 60 * 60;
            var m1 = Math.floor(s1/60);
            s1 %= 60;
            var h2 = h1 ? h1+':' : '',
                m2 = h1 && m1<10 ? '0'+m1 : m1,
                s2 = s1<10 ? '0'+s1 : s1;
            return h2 + m2 + ':' + s2;
        }
        return tdur(Math.round(this._length_ms / 1000));
    }
}

export class Album {
    id: number;
    _art_blob: string;
    _metadata: Map<string, string>;
}

export class Series {
    id: number;
    _art_blob: string;
    _background_art_blob: string;
    _metadata: Map<string, string>;
}