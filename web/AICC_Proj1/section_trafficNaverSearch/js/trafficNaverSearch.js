// 지하철 코드 정보 등록
const traffic_NaverData= {
    "가산디지털단지":"172,746",
    "홍대입구":"239,4003,1609",
    "석남":"761,20222",
    "검단사거리":"711",
    "인천시청":"20124,20230"
}

// 결과 링크 생성
function setTrafficLink(){
    const startCode = $('#traffic_start')[0].value
    const StartNam =  $('#traffic_start :selected').text()
    const endCode = $('#traffic_end')[0].value
    const endName = $('#traffic_end :selected').text()

    // 인수 정합성 검증
    if (startCode==='-'){$("#traffic_pathFinder_result").text('시작역을 선택해주세요');return;}
    if (endCode==='-'){$("#traffic_pathFinder_result").text('도착역을 선택해주세요');return;}
    // 표시
    const ULR = `https://map.naver.com/p/subway/1000/${startCode}/${endCode}/-`
    $("#traffic_pathFinder_result").attr('href',ULR)
    $("#traffic_pathFinder_result").text(`[${StartNam} ▶${endName} ] 네이버 지도`)

}

// 엘레멘트 생성 스크립트 작성
function CreateNaverMaptMetroFinder(){
    // 요소 생성 시작
    let trafficContainer = $('#trafficNaverSearch')
    let traffic_pathFinder = $(' <div id="traffic_pathFinder"></div>')
    let traffic_inputContainer = $('<div id="traffic_inputContainer"></div>')
    trafficContainer.append(traffic_pathFinder)
    traffic_pathFinder.append(traffic_inputContainer)

    // 출발역 선택 목록 생성
    let traffic_start = $('<select id="traffic_start"></select>')
    traffic_start.append(`<option value="-">=출발역 선택=</option>`)
    for (let key in traffic_NaverData) {
        traffic_start.append(`<option value="${traffic_NaverData[key]}">${key}</option>`)
    }
    traffic_inputContainer.append(traffic_start)

    // 도착역 선택 목록 생성
    let traffic_end = $('<select id="traffic_end"></select>')
    traffic_end.append(`<option value="-">=도착역 선택=</option>`)
    for (let key in traffic_NaverData) {
        traffic_end.append(`<option value="${traffic_NaverData[key]}">${key}</option>`)
    }
    traffic_inputContainer.append(traffic_end)

    // 결과 링크 생성
    traffic_pathFinder.append($(`<a id="traffic_pathFinder_result" href="" target="_blank"> 출발역과 도착역을 입력하세요</a>`))

    // 이벤트 등록 : 목록 선택 시 링크 생성
    $('#traffic_start, #traffic_end').change(setTrafficLink)

}
$(CreateNaverMaptMetroFinder)