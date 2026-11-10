// Delete : 장소를 지운다.
// 원래는 /map 백엔드로 DELETE 요청을 보내는 자리 — 지금은 이 브라우저의 IndexedDB 에서 지운다.
const request_DeleteHotSpot = (data) => {
    const {spot_id} = data
    // spot_id : 해당 이미지의 id
    return spotStore.remove(Number(spot_id));
}
