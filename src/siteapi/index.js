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
    results: Array<Song>;

    constructor() {
        this.results = [];
    }

    static fromDoc(doc): SongSearchResponse {
        let out = new SongSearchResponse();
        for (let x of doc['results']) {
            out.results.push(Song.fromDoc(x));
        }
        return out;
    }
}

export class AlbumGetResponse {
    songs: Array<Song>;

    static fromDoc(doc): AlbumGetResponse {
        let out = new AlbumGetResponse();
        for (let x of doc['songs']) {
            out.songs.push(Song.fromDoc(x));
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
    _album: Album;
    _blob: string;
    _length_ms: number;
    _track_no: number;
    _metadata: Map<string, string>;

    static fromDoc(doc: any): Song {
        let out = new Song();
        out.id = doc['id'];
        out._album = Album.fromDoc(doc['album']);
        out._blob = doc['blob'];
        out._length_ms = doc['length_ms'];
        out._track_no = doc['track_no'];
        out._metadata = doc['metadata'];
        return out;
    }

    _getMetaField(field: string, defval: ?string = undefined): string {
        let target = field.toUpperCase();
        for (let [k, v] of Object.entries(this._metadata)) {
            if (target == k.toUpperCase()) {
                return v;
            }
        }
        for (let [k, v] of Object.entries(this._album._metadata)) {
            if (target == k.toUpperCase()) {
                return v;
            }
        }
        if (defval != null) {
            return defval;
        }
        throw new KeyError('key not found: ' + field);
    }

    title(defval:?string=undefined): string {
        return this._getMetaField("TITLE", defval);
    }

    artist(defval:?string=undefined): string {
        return this._getMetaField("ARTIST", defval);
    }

    album(defval:?string=undefined): string {
        return this._getMetaField("ALBUM", defval);
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

    static fromDoc(doc: any): Album {
        let out = new Album();
        out.id = doc['id'];
        out._art_blob = doc['art_blob'];
        out._metadata = doc['metadata'];
        return out;
    }
}