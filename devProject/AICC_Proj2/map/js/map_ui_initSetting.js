// 화면 로드된 이후에 Element 설정
document.addEventListener('DOMContentLoaded', function() {

    //사진추가 element 추가
    init_Create_addPictureInput()

});

// UI 단위로 함수화하여 관리
const init_Create_addPictureInput = ()=>{
    // 1. 화면에서 장소추가 버튼 생성 및 이벤트 연동하기.
    const btn_AddImage = createElement({
        tagName : 'button',
        textContent : '장소 등록',
        id:'btn_addHotSpot',
        onclick : function() {
            input_AddImage.click();
        }
    });
    document.body.appendChild(btn_AddImage);

    // 2. 화면에 안보이는 input 생성하여 이벤트 적용하기
    //<input type="file" accept="image/ㅁ*">
    // 요소는 모바일 기기에서 사용자가 터치하면 기본적으로 해당 기기의 사진 라이브러리, 카메라, 또는 파일 시스템에 접근할 수 있는 인터페이스를 제공함
    // 이는 모바일 운영 체제와 브라우저가 자동으로 처리해 주기 때문에, 개발자가 별도로 모바일 특화 기능을 구현하지 않아도 됩니다.
    const input_AddImage = createElement({
        id:'input_AddImage',
        tagName : 'input',
        change : function(e) {
            // 입력받은 파일이 없으면 리턴
            if (e.target.files.length === 0) {
                return null
            }
            // 입력받은 파일 있으면 이미지 만들기
            createImageConainer({
                file:e.target.files[0],
                dropX:0,
                dropY:0
            })
        }
    });
    input_AddImage.type = 'file';
    input_AddImage.accept = 'image/*';
    input_AddImage.style.display = 'none';
    btn_AddImage.appendChild(input_AddImage);
    // document.body.appendChild(input_AddImage);

    document.querySelectorAll('.draggable').forEach(function (elem) {
        elem.classList.add('imageHotSpot')
    });
}