/**
 * 특정 핫스팟의 위치 정보를 업데이트하기 위해 서버에 요청을 보냅니다.
 * 요청은 `/map/update` 엔드포인트를 통해 POST 메소드로 전송됩니다.
 * 요청이 성공적으로 처리되면, 서버로부터의 응답에 포함된 `succeed` 값을 기반으로
 * true 또는 false를 반환하는 프로미스를 반환합니다.
 *
 * @Author wbpark
 * @param {Object} data - 업데이트할 핫스팟의 정보를 포함하는 객체입니다.
 * @param {number} data.spot_id - 핫스팟의 고유 ID입니다.
 * @param {string} data.src - 핫스팟 이미지의 경로입니다.
 * @param {number} data.left - 핫스팟의 새로운 왼쪽 좌표입니다.
 * @param {number} data.top - 핫스팟의 새로운 상단 좌표입니다.
 *
 * @returns {Promise<boolean>} 비동기적으로 실행되며, 핫스팟의 업데이트 성공 여부에 따라
 * true 또는 false를 resolve하는 프로미스를 반환합니다. 요청 처리 중 에러가 발생한 경우,
 * 프로미스는 reject되며, 호출자는 이를 적절히 처리해야 합니다.
 *
 */
const request_UpdateHotSpot = (data) => {
    const {spot_id, src, left, top} = data

    // alert('request_UpdateHotSpot : ' + JSON.stringify(data, (key, value) => {
    //     return (typeof value === "string" && value.length > 30) ? value.substring(0, 30) + "..." : value;
    // }, 2))

    return new Promise((resolve, reject) => { // 프로미스 반환 시작
        // /map 백엔드로 요청 보내기
        fetch('/map/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                spotId: spot_id,
                src: src,
                newLeft: left,
                newTop: top
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('이미지 위치 변경에 실패했습니다.')
                }
                // 서버로부터 응답을 JSON 형태로 받아 리턴합니다.
                return response.json();
            })
            .then(res => {
                // 서버로부터 받은 JSON 데이터를 콘솔에 출력합니다.
                console.log('Response :', JSON.stringify(res));
                if (res.succeed) {
                    resolve(res.succeed); // Promise를 사용하여 succeed 값을 반환
                }
            })
            .catch(error => {
                console.error('Error:', error); // 에러 처리
                reject(false); // 실패 시 false 반환
            }).finally(() => {
            console.log('CreateHotSpot 함수 종료')
        });
    }); // 프로미스 반환 끝
}