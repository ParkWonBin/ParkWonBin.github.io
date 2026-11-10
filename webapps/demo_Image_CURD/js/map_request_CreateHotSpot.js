// Create : 새 장소(사진 + 위치)를 저장하고 새 id 를 돌려준다.
// 원래는 /map 백엔드로 PUT 요청을 보내는 연습용이었지만, GitHub Pages 에는 서버가 없어
// 이 브라우저의 IndexedDB(map_store_IndexedDB.js)에 저장한다.
//   Create : add · Read : list · Update : update · Delete : remove
const request_CreateHotSpot = async (data) => {
    const {file, left, top} = data
    // file: Blob(줄인 사진),
    // left: vw 단위 (숫자 또는 '12.3vw'),
    // top: vh 단위 (숫자 또는 '45.6vh'),
    const buffer = await readBlobAsArrayBuffer(file);
    return spotStore.add({
        data: buffer,
        type: file.type || 'image/jpeg',
        left: parseFloat(left) || 0,
        top: parseFloat(top) || 0,
        created: Date.now()
    });
}

// Blob → ArrayBuffer (blob.arrayBuffer() 가 없는 오래된 브라우저도)
const readBlobAsArrayBuffer = (blob) => {
    if (blob.arrayBuffer) { return blob.arrayBuffer(); }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(blob);
    });
}
