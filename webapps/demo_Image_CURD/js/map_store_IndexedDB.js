// 서버 대신 이 브라우저의 IndexedDB 에 장소(사진 + 위치)를 저장한다.
// GitHub Pages 는 정적 호스팅이라 예전처럼 fetch('/map') 로 PUT / PATCH / DELETE 를 보내면 404 만 돌아왔다.
// map_request_*.js 가 이 저장소를 쓴다.
//
//   레코드 : { id, left, top, created, src }          ← 함께 들어 있는 예시 사진 (./images/upload/…)
//            { id, left, top, created, data, type }   ← 올린 사진 (줄인 뒤 ArrayBuffer 로. 오래된 사파리도 Blob 보다 잘 저장한다)
//   left / top : vw / vh 단위 숫자
//
//   처음 방문해 DB 가 새로 만들어질 때 예시 사진 3장을 넣는다. 다 지우면 빈 지도로 남고, reset() 으로 예시 사진만 남긴다.
//   IndexedDB 를 못 쓰는 환경(일부 사생활 보호 모드 등)에서는 메모리에만 두고, 새로고침하면 처음으로 돌아간다.
const SAMPLE_SPOTS = [
    {src: './images/upload/image1.jpg', left: 10, top: 10},
    {src: './images/upload/image2.jpg', left: 30, top: 30},
    {src: './images/upload/image3.jpg', left: 50, top: 50},
];

const spotStore = (() => {
    const DB_NAME = 'demo_Image_CURD';
    const STORE = 'spots';
    const samples = () => SAMPLE_SPOTS.map(s => Object.assign({created: Date.now()}, s));

    // ── IndexedDB ────────────────────────────────────────
    const openDB = () => new Promise((resolve, reject) => {
        if (!window.indexedDB) { return reject(new Error('IndexedDB 를 지원하지 않는 브라우저')); }
        // 드물게 open 이 끝나지 않는 브라우저가 있어 기다리는 시간을 둔다
        const timer = setTimeout(() => reject(new Error('IndexedDB 응답 없음')), 5000);
        let req;
        try { req = indexedDB.open(DB_NAME, 1); } catch (e) { clearTimeout(timer); return reject(e); }
        req.onupgradeneeded = () => {
            // DB 가 처음 만들어질 때(= 첫 방문) 예시 사진을 넣어 둔다
            const os = req.result.createObjectStore(STORE, {keyPath: 'id', autoIncrement: true});
            samples().forEach(s => os.add(s));
        };
        req.onsuccess = () => {
            clearTimeout(timer);
            const db = req.result;
            db.onversionchange = () => db.close();
            resolve(db);
        };
        req.onerror = () => { clearTimeout(timer); reject(req.error); };
    });

    const idbBackend = (db) => {
        // 트랜잭션 하나를 열어 work(objectStore, done) 를 실행하고, 커밋되면 done 에 넘긴 값으로 끝난다
        const run = (mode, work) => new Promise((resolve, reject) => {
            let t;
            try { t = db.transaction(STORE, mode); } catch (e) { return reject(e); }
            let result;
            t.oncomplete = () => resolve(result);
            t.onerror = () => reject(t.error);
            t.onabort = () => reject(t.error || new Error('저장이 취소됨'));
            work(t.objectStore(STORE), v => { result = v; });
        });
        return {
            persistent: true,
            list: () => run('readonly', (os, done) => {
                const r = os.getAll();
                r.onsuccess = () => done(r.result);
            }),
            add: rec => run('readwrite', (os, done) => {
                const r = os.add(rec);
                r.onsuccess = () => done(r.result);
            }),
            update: (id, patch) => run('readwrite', (os, done) => {
                const r = os.get(id);
                r.onsuccess = () => {
                    if (!r.result) { return done(false); }
                    os.put(Object.assign(r.result, patch));
                    done(true);
                };
            }),
            remove: id => run('readwrite', os => { os.delete(id); }),
            reset: () => run('readwrite', os => {
                os.clear();
                samples().forEach(s => os.add(s));
            }),
        };
    };

    // ── IndexedDB 를 못 쓸 때 : 메모리 ────────────────────
    const memoryBackend = () => {
        let rows = [];
        let next = 1;
        const seed = () => { rows = samples().map(s => Object.assign(s, {id: next++})); };
        seed();
        return {
            persistent: false,
            list: async () => rows.map(r => Object.assign({}, r)),
            add: async rec => { const id = next++; rows.push(Object.assign({}, rec, {id})); return id; },
            update: async (id, patch) => {
                const r = rows.find(x => x.id === id);
                if (r) { Object.assign(r, patch); }
                return !!r;
            },
            remove: async id => { rows = rows.filter(x => x.id !== id); },
            reset: async () => seed(),
        };
    };

    // 처음 쓸 때 어느 쪽에 저장할지 정한다
    let backend = null;
    const getBackend = () => backend || (backend = openDB().then(idbBackend, err => {
        console.warn('이 브라우저에 저장할 수 없어 메모리에만 둡니다 :', err && err.message);
        return memoryBackend();
    }));
    const call = (name, ...args) => getBackend().then(b => b[name](...args));

    return {
        isPersistent: () => getBackend().then(b => b.persistent),
        list: () => call('list'),
        add: rec => call('add', rec),
        update: (id, patch) => call('update', id, patch),
        remove: id => call('remove', id),
        reset: () => call('reset'),
    };
})();
