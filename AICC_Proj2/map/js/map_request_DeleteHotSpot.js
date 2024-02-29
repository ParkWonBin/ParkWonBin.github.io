const request_DeleteHotSpot = (data) => {
    const {spot_id,src} = data
    // spot_id : 해당 이미지의 id,
    // src : 해당 이미지의 경로
    alert('request_DeleteHotSpot : '+JSON.stringify(data,null,2))

    // payload 만들기
    const formData = new FormData();
    formData.append('spot_id', spot_id);
    formData.append('src', src);
    // 세션 통해 id 넘기고 본인이 만든것만 수정하도록

    // /map 백엔드로 요청 보내기
    // Create : put
    // Read : get
    // Update : patch
    // Delete : delete
    fetch('/map', {
        method: 'DELETE',
        body: formData
    })
        .then(response => {
            if (!response.ok) { throw new Error('이미지 등록에 실패했습니다.') }
            // 서버로부터 응답을 JSON 형태로 받아 리턴합니다.
            return response.json();
        })
        .then(res => {
            // 서버로부터 받은 JSON 데이터를 콘솔에 출력합니다.
            console.log('Response :', JSON.stringify(res));
        })
        .catch(error => {
            console.error('Error:', error); // 에러 처리
        }).finally(()=>{
        console.log('CreateHotSpot 함수 종료')
    });
}