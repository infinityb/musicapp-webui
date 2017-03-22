class InflationContext {
    _registry: Map<string, ObjectInflater>,
    // for any references already resolved, hold their value here.
    _inflated: Map<string, any /* inflated value */>;
    // uninflated known values
    _embedded: Map<string, any /* deflated value */>;
}

export function graph_inflate_collection(
    rpc: any,
    registry: Map<string, ObjectInflater>,
    graph: any,
): Array<any> {
    class GraphError {
        constructor(msg) {
            this._message = msg;
        }
    };
    fn resolve_inflater(registry, item) {
        let item_class = item['class'];
        if (item_class == undefined) {
            throw new GraphError("no class for item");
        }
        let obj_inflater = registry[item_class];
        if (obj_inflater == undefined) {
            throw new GraphError("unknown class" + item['class']);
        }
        return obj_inflater
    }

    let ctx = new InflationContext();
    ctx._registry = registry;
    ctx._inflated = {};
    ctx._embedded = {};

    let out = [];
    let inflation_queue = [];
    for (let item of graph['_items']) {
        // TODO: fold resolve_inflater(..).inflate_partial(..) into the InflationContext
        let partial_inflation = resolve_inflater(ctx._registry, item).inflate_partial(ctx, item);
        for (dep of partial_inflation.dependencies) {
            if (ctx._inflated[dep.name] == null) {
                inflation_queue.push(dep);
            }
        }
        out.push(partial_inflation.item);
    }

    var offset = 0;
    while (offset < inflation_queue.length) {
        let dep = inflation_queue[offset];

        let partial_inflation = resolve_inflater(ctx._registry, item).inflate_partial(ctx, item);
        for (dep of partial_inflation.dependencies) {
            if (ctx._inflated[dep.name] == null) {
                inflation_queue.push(dep);
            }
        }
        
    }
    return out;
}

function extract_ref(obj: any): ?string {
    if (obj['$ref'] == null) {
        return null;
    }
    return obj['$ref']
}

export class SongInflater {
    inflate_partial(ctx: InflationContext, obj: any): Inflated<Song> {
        let out = new Inflated(new Song());
        out.item.id = obj['id'];
        out.item._blob = obj['blob'];
        out.item._length_ms = obj['length_ms'];
        out.item._track_no = obj['track_no'];
        out.item._metadata = obj['metadata'];
        let ref_name = extract_ref(obj['album']);
        if (ref_name == null) {
            throw new GraphError("bad album ref");
        }
        out.item._album = new Promise(function(resolve, reject) {
            out.dependencies.push(new Dependency(ref_name, resolve, reject));
        });
        return out;
    }
}

export class AlbumInflater {
    inflate_partial(ctx: InflationContext, obj: any): Inflated<Album> {
        let out = new Inflated(new Album());
        out.item.id = obj['id'];
        out.item._art_blob = obj['art_blob'];
        out.item._metadata = obj['metadata'];
        return out;
    }
}

export class Inflated<T> {
    dependencies: Array<Dependency>,
    item: T;

    constructor(item: T) {
        this.dependencies = [];
        this.item = item;
    }
}

export class Dependency {
    name: string,
    resolve: any,
    reject: any,

    constructor(name: string, resolve: any, reject: any) {
        this.name = name;
        this.resolve = resolve;
        this.reject = reject;
    }
}

export class Song {
    id: number;
    _album: Promise<Album>;
    _blob: string;
    _length_ms: number;
    _track_no: number;
    _metadata: Map<string, string>;
}

export class Album {
    id: number;
    _art_blob: string;
    _metadata: Map<string, string>;
}