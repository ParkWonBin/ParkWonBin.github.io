// 화면 로드된 이후에 Element 설정
document.addEventListener('DOMContentLoaded', function() {

    //사진추가 element 추가
    init_Create_addPictureInput()

    // '이 브라우저에만 저장돼요' 안내 + 처음 사진으로 되돌리기
    init_StoreNote()

    // 저장된 장소 불러오기 (처음 방문이면 예시 사진 3장)
    loadHotSpots()

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
            // 입력받은 파일 있으면 이미지 만들기 (화면 가운데에 배치)
            createImageConainer({
                file:e.target.files[0],
                dropX:window.innerWidth / 2,
                dropY:window.innerHeight / 2
            })
            // 같은 사진을 다시 골라도 change 가 일어나도록 비워 둔다
            e.target.value = '';
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

// 저장 안내 : 서버가 없어서 이 브라우저(IndexedDB)에만 저장된다는 것을 알리고, 처음 상태로 되돌릴 수 있게 한다.
// 등록 · 이동 · 삭제 결과도 여기에 잠깐 보여 준다.
let storeNoteText = '이 브라우저에만 저장돼요';
const init_StoreNote = () => {
    const note = createElement({tagName: 'div', id: 'storeNote'});
    const msg = createElement({tagName: 'span', className: 'storeNote-msg', textContent: storeNoteText});
    msg.setAttribute('role', 'status');
    note.title = '서버 없이 이 브라우저에만 저장돼요. 다른 기기나 브라우저에서는 보이지 않아요.';

    const btnReset = createElement({
        tagName: 'button',
        id: 'btn_resetSpots',
        textContent: '처음 사진으로',
        onclick: () => {
            if (!confirm('처음 예시 사진 3장으로 되돌릴까요?\n이 브라우저에 저장한 사진과 위치가 모두 지워져요.')) { return }
            spotStore.reset()
                .then(request_ReadHotSpots)
                .then(spots => {
                    renderHotSpots(spots);
                    showStoreMsg('처음 사진으로 되돌렸어요');
                })
                .catch(err => {
                    console.error('되돌리기 실패 :', err);
                    showStoreMsg('되돌리지 못했어요', true);
                });
        }
    });
    btnReset.type = 'button';
    btnReset.title = '저장한 사진과 위치를 지우고 처음 예시 사진 3장으로 되돌려요';

    note.appendChild(msg);
    note.appendChild(btnReset);
    // 지도(드롭 영역) 안에 둔다 : 안내 위에 사진을 떨어뜨려도 지도에 놓이도록
    document.getElementsByClassName('drop-area')[0].appendChild(note);

    // IndexedDB 를 못 쓰는 브라우저면 안내를 바꾼다
    spotStore.isPersistent().then(persistent => {
        if (persistent) { return }
        storeNoteText = '저장이 안 되는 브라우저예요';
        note.title = '이 브라우저에서는 저장할 수 없어 새로고침하면 처음 상태로 돌아가요.';
        if (!note.classList.contains('is-flash')) { msg.textContent = storeNoteText }
    });
}

// 결과 문구를 잠깐 보여 주고 다시 안내 문구로
let storeMsgTimer = null;
const showStoreMsg = (text, isError) => {
    const note = document.getElementById('storeNote');
    if (!note) { return }
    note.querySelector('.storeNote-msg').textContent = text;
    note.classList.add('is-flash');
    note.classList.toggle('is-error', !!isError);
    clearTimeout(storeMsgTimer);
    storeMsgTimer = setTimeout(() => {
        note.querySelector('.storeNote-msg').textContent = storeNoteText;
        note.classList.remove('is-flash', 'is-error');
    }, isError ? 4000 : 2500);
}

// 저장된 장소를 불러와 지도에 그린다 (Read)
const loadHotSpots = () => request_ReadHotSpots()
    .then(renderHotSpots)
    .catch(err => {
        console.error('불러오기 실패 :', err);
        showStoreMsg('저장된 사진을 불러오지 못했어요', true);
    });
