// $(String_Selector)  : 요소 찾아서 돌려줌
// $(String_HTML)  : 입력받은 HTML 코드를 지가 새롭게 생성해서 돌려줌.
// $(function) : 페이지 로드 완료됐을 떄 해당 함수 돌리라고 등록해줌
// $(element) : 해당 요소를 jquery 객체로 만들어줌

var traffic_slide_gallery_Xoffset = 0;
var intervalId = null;
const TRAFFIC_IMAGE_WIDTH= 600

function traffic_Move() {
    traffic_slide_gallery_Xoffset -= TRAFFIC_IMAGE_WIDTH
    if (traffic_slide_gallery_Xoffset < -8*TRAFFIC_IMAGE_WIDTH) {
        traffic_slide_gallery_Xoffset = 0
    }
    $('#traffic_slide_gallery').animate({'marginLeft': `${traffic_slide_gallery_Xoffset}px`}, 300)
}

function traffic_back() {
    traffic_slide_gallery_Xoffset += TRAFFIC_IMAGE_WIDTH
    if (traffic_slide_gallery_Xoffset > 0) {
        traffic_slide_gallery_Xoffset = -8*TRAFFIC_IMAGE_WIDTH
    }
    $(`#traffic_slide_gallery`).animate({'marginLeft': `${traffic_slide_gallery_Xoffset}px`}, 300)
}

function traffic_play() {
    // setInterval의 ID를 저장하고 반환
    if (intervalId === null) {
        intervalId = setInterval(traffic_Move, 1000);
        $('#traffic_playToggle').text('■')
        $('#traffic_playToggle').addClass('BigChar')
    } else {
        clearInterval(intervalId);
        intervalId = null
        $('#traffic_playToggle').removeClass('BigChar')
        $('#traffic_playToggle').text('▶')
    }


    // $('#trafic_playTogle').text('stop!!!!!!!!!!!!!!!')
    // $('#trafic_playTogle').attr('onclick','trafic_back()')
}

// 생성후 바로 추가 예시
// $('body').append($('<div>test</div>'));

// function CreateTrafficSlider(){
//     let trafficContainder = $('#traffic')
//     let trafficBackBtn = $('<button onclick="traffic_back()">back</button>')
//     trafficContainder.append(trafficBackBtn)
//
//     let traffic_gallery_wrap = $('<div id="traffic_gallery_wrap"></div>')
//     let traffic_slide_gallery = $('<div id="traffic_slide_gallery"></div>')
//     let img1 = $('<img src="src/1호선.jpg" alt="사진1">')
//
//     trafficContainder.append(traffic_gallery_wrap)
//     traffic_gallery_wrap.append(traffic_slide_gallery)
//     traffic_slide_gallery.append(img1)
//     traffic_slide_gallery.append($('<img src="src/2호선." alt="사진2">'))
// }

function CreateTrafficSlider(){
    let trafficContainder = $('#trafficMetroline')
    // 슬라이더 추가
    let traffic_gallery_wrap = $('<div id="traffic_gallery_wrap"></div>')
    let traffic_slide_gallery = $('<div id="traffic_slide_gallery"></div>')

    trafficContainder.append(traffic_gallery_wrap)
    traffic_gallery_wrap.append(traffic_slide_gallery)

    for(let i = 1; i<=9; i++){
        traffic_slide_gallery.append($(`<img class="traffic_slide_gallery_Image" src="src/${i}호선.jpg" alt="사진${i}">`))
    }

    // 버튼 추가
    let buttonContainer = $(`<div id='trafficMatroline_BtnContainer'></div>`)
    trafficContainder.append(buttonContainer)
    buttonContainer.append( $('<button onclick="traffic_back()">◀◀</button>'))
    buttonContainer.append( $('<button id="traffic_playToggle" onclick="traffic_play()">▶</button>'))
    buttonContainer.append( $('<button onclick="traffic_Move()">▶▶</button>'))
}

//DOM 완료되면 테그 생성해주기
$(CreateTrafficSlider)


    // function traffic_stop() {
//     // 저장한 setInterval의 ID를 활용하여 clearInterval 호출
//     clearInterval(intervalId);
//     intervalId = null
// }