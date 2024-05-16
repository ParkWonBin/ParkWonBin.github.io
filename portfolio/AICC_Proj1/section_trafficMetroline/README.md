## 지하철 섹션
지하철 노선도 관련된 이미지를 등록하는 위치입니다.  
이미지 작업이 끝난 후에는, common > src 경로에 파일을 복사해주세요.

## 기능 명세
### 지하철 노선도 :
- [x] 이미지 리소스 확보 (1/12)  - 이지우
 예시 이미지
![1호선](https://mblogthumb-phinf.pstatic.net/20150627_37/revolutio419_1435375888142XpTtP_PNG/LINE_1.png?type=w420)
- [x] 애니메이션 슬라이드 초안 (1/12) - 박원빈
  
- [x] 오른쪽으로 이미지 이동 버튼 구현 (1/12) - 박원빈 (예시코드)
 ```js
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
```

- [x] 왼쪽으로 이미지 이동 버튼 구현 (1/15) - 이지우

```js
function traffic_back() {
    traffic_slide_gallery_Xoffset += TRAFFIC_IMAGE_WIDTH
    if (traffic_slide_gallery_Xoffset > 0) {
        traffic_slide_gallery_Xoffset = -8*TRAFFIC_IMAGE_WIDTH
    }
    $(`#traffic_slide_gallery`).animate({'marginLeft': `${traffic_slide_gallery_Xoffset}px`}, 300)
}
```

- [x] 자동넘기기 활성화 되면 중지 버튼으로 기능 변경(재생/중지 기능버튼 일체화) (1/16) - 박원빈

```js
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
}
```

- [x] 각종 버튼과 이미지에 대한 CSS 설정 - 박원빈 (1/16)
