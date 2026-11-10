// Update : 장소의 위치를 바꿔 저장한다. 저장된 장소가 없으면 false.
// 원래는 /map 백엔드로 PATCH 요청을 보내는 자리 — 지금은 이 브라우저의 IndexedDB 에 저장한다.
const request_UpdateHotSpot = (data) => {
    const {spot_id, left, top} = data
    // spot_id : 해당 이미지의 id,
    // left: vw 단위 (숫자 또는 '12.3vw'),
    // top: vh 단위 (숫자 또는 '45.6vh'),
    return spotStore.update(Number(spot_id), {
        left: parseFloat(left) || 0,
        top: parseFloat(top) || 0
    });
}
