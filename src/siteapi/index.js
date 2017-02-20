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
        return new Promise(function(resolve, reject) {
            $.ajax("http://music.yshi.org:8001/login", {
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
        return new Promise(function(resolve, reject) {
            $.ajax("http://music.yshi.org:8001/songs ", {
                method: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "bearer " + window.localStorage['auth_token']
                },
            }).done(function (msg) {
                resolve(SongSearchResponse.fromDoc(msg));
            }).fail(function( jqXHR, textStatus ) {
                console.log("err = ", jqXHR);
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

export class Song {
    id: number;
    _album: Album;
    _blob: string;
    _length_ms: number;
    _track_no: number;
    _metadata: Map<string, string>;

    static fromDoc(doc: any): Song {
        console.log("doc = ", doc);
        let out = new Song();
        out.id = doc['id'];
        out._album = Album.fromDoc(doc['album']);
        out._blob = doc['blob'];
        out._length_ms = doc['length_ms'];
        out._track_no = doc['track_no'];
        out._metadata = doc['metadata'];
        return out;
    }

    _getMetaField(field: string): string {
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
        throw new KeyError();
    }

    title(): string {
        return this._getMetaField("TITLE");
    }

    artist(): string {
        return this._getMetaField("ARTIST");
    }

    album(): string {
        return this._getMetaField("ALBUM");
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