/**
 * 서버에 새 핫스팟 생성 요청을 보내고, 응답을 처리합니다.
 *
 * 이 함수는 사용자로부터 받은 이미지 파일(Base64 인코딩 문자열)과 위치 정보를
 * 서버의 '/map/create' 엔드포인트로 POST 요청을 보내어 새 핫스팟을 생성합니다.
 * 요청이 성공하면, 서버로부터의 응답을 JSON 형태로 받아 콘솔에 출력합니다.
 * 요청이 실패하면, 적절한 에러 메시지를 콘솔에 출력합니다.
 * 모든 처리가 끝나면, 함수의 실행이 종료되었음을 알리는 메시지를 콘솔에 출력합니다.
 * 서버로부터의 응답에 포함된 `succeed` 값을 기반으로 true 또는 false를 반환하는 프로미스를 반환합니다.
 *
 * @param {Object} data - 생성할 핫스팟의 데이터를 담고 있는 객체.
 * @param {string} data.file - 생성할 핫스팟의 이미지 파일(Base64 인코딩 문자열).
 * @param {number} data.left - 핫스팟의 위치(왼쪽에서의 거리 vw단위).
 * @param {number} data.top - 핫스팟의 위치(상단에서의 거리 vh단위).
 * @returns {Promise<boolean>}  비동기적으로 실행되며, 핫스팟의 업로드 성공 여부에 따라
 * true 또는 false를 resolve하는 프로미스를 반환합니다. 요청 처리 중 에러가 발생한 경우,
 * 프로미스는 reject되며, 호출자는 이를 적절히 처리해야 합니다.
 *
 * @throws {Error} 요청 처리 중 발생한 에러. 요청이 실패하면 에러가 발생하며, catch 블록에서 처리됩니다.
 *
 * @example
 * request_CreateHotSpot({
 *   file: "data:image/png;base64,iVBORw0KGgoAAAANS...",
 *   left: 10vw,
 *   top: 20vh
 * }).then(succeed => {
*      if (succeed) {
*          console.log("이미지 업로드 성공");
*     } else {
*          console.log("이미지 업로드 실패");
*     }
 * }).catch((error) => {
 *   console.error("핫스팟 생성 요청 처리 중 오류가 발생했습니다: ", error);
 * });
 */
const request_CreateHotSpot = (data) => {
    const {file, left, top} = data
    // alert('request_CreateHotSpot : '+JSON.stringify(data,(key, value)=>{
    //         return (typeof value === "string" && value.length > 30) ? value.substring(0, 30) + "..." :value;
    // },2))

    return new Promise((resolve, reject) => { // 프로미스 반환 시작
        // /map 백엔드로 요청 보내기
        fetch('/map/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                base64Data: file,
                top: top,
                left: left
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('이미지 등록에 실패했습니다.')
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