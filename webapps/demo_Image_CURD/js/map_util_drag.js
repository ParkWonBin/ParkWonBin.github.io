
// 드래그 로직
document.addEventListener('DOMContentLoaded', (event) => {
    let elem_selected = null;
    let offsetX = 0; // 마우스 클릭 위치와 이미지의 x 위치 차이
    let offsetY = 0; // 마우스 클릭 위치와 이미지의 y 위치 차이
    let startPos = ''; // 끌기 전 위치 (옮겼는지 알아보기용)

    // PC버전에서 드래그 기능 사용을 위한 설정입니다.
    document.addEventListener('mousedown', act_drag_start);
    document.addEventListener('mousemove', act_drag_move);
    document.addEventListener('mouseup', act_drag_end);

    // 태블릿, 모바일에서 드래그 기능 사용을 위한 설정입니다.
    // 크롬의 경우 터치 이벤트에 등록된 기본 함수를 제거하기 위해 {passice:false} 설정이 필요하다.
    // 사파리의 경우 css에서 { touch-action: none } 으로 스크롤 및 새로고침을 방지할 수 있습니다.
    document.addEventListener('touchstart', act_drag_start, { passive: false });
    document.addEventListener('touchmove', act_drag_move, { passive: false });
    document.addEventListener('touchend', act_drag_end);

    // 클릭 및 터치 시작
    function act_drag_start(e) {
        // 사진 위의 버튼([등록] [이동] [삭제])은 끌기를 시작하지 않는다
        // : 버튼을 잡고 끌다 놓았을 때 삭제 · 저장이 눌리지 않고, 터치로 누르면 브라우저가 click 을 만들어 준다
        if (e.target.closest && e.target.closest('button')) { return }
        const elems_draggable = e.target.closest('.draggable'); // 클릭된 요소에서 가장 가까운 .draggable 요소를 찾습니다.
        if (elems_draggable) {
            elem_selected = elems_draggable; // dragable 클래스를 가진 div를 선택합니다.
            elem_selected.style.zIndex = 1000; // 선택된 요소를 최상위로
            startPos = elem_selected.style.left + ',' + elem_selected.style.top; // 끌기 전 위치
            // 하이라이트 이미지
            elems_draggable.getElementsByTagName('img')[0].classList.add('selectedImg');

            const imgRect = elem_selected.getBoundingClientRect();

            // 이벤트 종류에 따른 처리
            e.preventDefault(); // 모바일에서 터치이동시 스크롤 및 새로고침 방지
            const e_target = e.touches ? e.touches[0] : e
            offsetX = e_target.clientX - imgRect.left;
            offsetY = e_target.clientY - imgRect.top;
        }
    }
    // 클릭 및 터치 후 이동
    function act_drag_move(e) {
        if (elem_selected) {
            let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 100;
            let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 100;

            // 클릭한 지점에 상대적으로 이미지 이동 (오프셋 고려)
            e.preventDefault(); // 모바일에서 터치이동시 스크롤 및 새로고침 방지
            const e_target = e.touches ? e.touches[0] : e
            let newLeft = (e_target.clientX - offsetX) / vw;
            let newTop = (e_target.clientY - offsetY) / vh;

            elem_selected.style.left = newLeft + 'vw';
            elem_selected.style.top = newTop + 'vh';
        }
    }
    // 클릭 및 터치 종료
    function act_drag_end() {
        if (elem_selected) {
            elem_selected.style.zIndex = ''; // 드래그 종료 시 zIndex 초기화
            const img = elem_selected.getElementsByTagName('img')[0];
            img.classList.remove('selectedImg');
            // 옮겼다면 저장하는 방법 안내 (위치는 [이동] · [등록]을 눌러야 저장된다)
            if (startPos !== elem_selected.style.left + ',' + elem_selected.style.top && typeof showStoreMsg === 'function') {
                showStoreMsg(img.getAttribute('data-id') ? '‘이동’을 누르면 이 위치가 저장돼요' : '‘등록’을 누르면 저장돼요');
            }
            elem_selected = null;
        }
    }
});