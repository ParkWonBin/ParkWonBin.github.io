/**
 * 서버에 핫스팟 삭제 요청을 보냅니다.
 *
 * 이 함수는 주어진 핫스팟 ID와 이미지 경로(src)를 사용하여 서버에 해당 핫스팟의 삭제를 요청합니다.
 * 요청이 성공적으로 처리되면, 서버로부터 응답받은 성공 여부를 프로미스로 반환합니다.
 * 만약 요청 중 오류가 발생하면, 오류 메시지를 콘솔에 출력하고, 프로미스를 통해 실패를 알립니다.
 *
 * @param {Object} data - 삭제할 핫스팟의 정보를 담고 있는 객체.
 * @param {number} data.spot_id - 삭제할 핫스팟의 고유 ID.
 * @param {string} data.src - 삭제할 핫스팟 이미지의 경로.
 * @returns {Promise<boolean>} 핫스팟 삭제 성공 여부를 나타내는 프로미스. 성공 시 true, 실패 시 false를 반환합니다.
 *
 * @example
 * request_DeleteHotSpot({
 *   spot_id: 1,
 *   src: 'path/to/image.jpg'
 * }).then(succeed => {
 *   if (succeed) {
 *     console.log('핫스팟 삭제 성공');
 *   } else {
 *     console.error('핫스팟 삭제 실패');
 *   }
 * }).catch(error => {
 *   console.error('핫스팟 삭제 중 오류 발생:', error);
 * });
 */
const request_DeleteHotSpot = (data) => {
    const {spot_id, src} = data

    // alert('request_DeleteHotSpot : ' + JSON.stringify(data, (key, value) => {
    //     return (typeof value === "string" && value.length > 30) ? value.substring(0, 30) + "..." : value;
    // }, 2))

    return new Promise((resolve, reject) => { // 프로미스 반환 시작
        fetch('/map/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                spotId: spot_id,
                src: src,
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('이미지 삭제에 실패했습니다.')
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