document.addEventListener('DOMContentLoaded', function () {
    // 1. 드래그 영역에 대한 초기 세팅
    // 기본 함수 제거 및, 뒤로 이벤트 확산되는거 제거.
    const dropArea = document.getElementsByClassName('drop-area')[0];
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // 2. 드레그 영역에 기능 추가
    // 이제 드레그 영영에 대해 drop 이벤트에 함수를 등록함.
    dropArea.addEventListener('drop', function (e) {
        // FileList를 배열로 변환 : forEach 를 쓰려면 아래처럼 배열로 전환해서 쓰거나
        // let files = [...files] 이렇게 배열 형식으로 다시 저장해야함.
        Array.from(e.dataTransfer.files).forEach(file =>
            createImageConainer({
                'file': file,
                'dropX': e.clientX,
                'dropY': e.clientY
            })
        );
    }, false);
});
