// Read : 저장된 장소 목록을 읽어 온다. (원래는 /map 백엔드에 GET 을 보내는 자리)
// 처음 방문이면 예시 사진 3장이 들어 있다. (map_store_IndexedDB.js)
const request_ReadHotSpots = () => spotStore.list()
