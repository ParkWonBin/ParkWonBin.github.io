
// 드래그 로직
document.addEventListener('DOMContentLoaded', (event) => {
    let selectedImg = null;
    let offsetX = 0; // 마우스 클릭 위치와 이미지의 x 위치 차이
    let offsetY = 0; // 마우스 클릭 위치와 이미지의 y 위치 차이

    function act_start(e) {
        const dragableElement = e.target.closest('.dragable'); // 클릭된 요소에서 가장 가까운 .dragable 요소를 찾습니다.
        if (dragableElement) {
            selectedImg = dragableElement; // dragable 클래스를 가진 div를 선택합니다.
            selectedImg.style.zIndex = 1000; // 선택된 요소를 최상위로
            // 하이라이트 이미지
            dragableElement.getElementsByTagName('img')[0].classList.add('selectedImg');

            const imgRect = selectedImg.getBoundingClientRect();

            // 이벤트 종류에 따른 처리
            e.preventDefault(); // 모바일에서 터치이동시 스크롤 및 새로고침 방지
            const e_target = e.touches ? e.touches[0] : e
            offsetX = e_target.clientX - imgRect.left;
            offsetY = e_target.clientY - imgRect.top;
        }
    }

    function act_move(e) {
        if (selectedImg) {
            let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 100;
            let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 100;

            // 클릭한 지점에 상대적으로 이미지 이동 (오프셋 고려)
            e.preventDefault(); // 모바일에서 터치이동시 스크롤 및 새로고침 방지
            const e_target = e.touches ? e.touches[0] : e
            let newLeft = (e_target.clientX - offsetX) / vw;
            let newTop = (e_target.clientY - offsetY) / vh;

            selectedImg.style.left = newLeft + 'vw';
            selectedImg.style.top = newTop + 'vh';
        }
    }

    function act_end() {
        if (selectedImg) {
            selectedImg.style.zIndex = ''; // 드래그 종료 시 zIndex 초기화
            selectedImg.getElementsByTagName('img')[0].classList.remove('selectedImg');
            selectedImg = null;
        }
    }

    document.addEventListener('mousedown', act_start);
    // document.addEventListener('touchstart', act_start); // pc 크롬, 모바일 safari 잘 작동, 모바일 크롬은 설정 추가 필요.
    document.addEventListener('touchstart', act_start, { passive: false });

    document.addEventListener('mousemove', act_move);
    // document.addEventListener('touchmove', act_move); // pc 크롬, 모바일 safari 잘 작동, 모바일 크롬은 설정 추가 필요
    document.addEventListener('touchmove', act_move, { passive: false });

    document.addEventListener('mouseup', act_end);
    document.addEventListener('touchend', act_end);
});