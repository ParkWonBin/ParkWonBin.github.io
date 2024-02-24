// 서버로 이미지 전송하는 함수
function sendImageDataToServer(file, left, top) {
    // alert('test')
    const formData = new FormData();
    formData.append('image', file); // 'image'는 서버에서 기대하는 필드명입니다.
    formData.append('left', left);
    formData.append('top', top);

    fetch('/MapImageUpload', {
        method: 'POST',
        body: formData // FormData는 Content-Type을 자동으로 설정합니다.
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 서버로부터 응답을 JSON 형태로 받습니다.
        })
        .then(data => {
            console.log('Response data:', data); // 서버로부터 받은 데이터를 콘솔에 출력합니다.
            // 서버로부터의 응답에 따라 조건부 로직을 수행합니다.
            if (data.status === '성공') {
                console.log('새로고침 시도');
                window.location.reload(); // 페이지를 새로고침합니다.
            } else {
                console.log('응답 처리 실패');
            }
        })
        .catch(error => {
            console.error('Error:', error); // 에러 처리
        });
}
////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
    // 1. db에서 가져온 이미지 초기 세팅
    // 이거 안하면 이미지 드래그 할 때마다 dragdrop한 것 처럼 인식함
    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('dragstart', function (e) {
        });
    });

    // 2. 드래그 영역에 대한 초기 세팅
    // 기본 함수 제거 및, 뒤로 이벤트 확산되는거 제거.
    const dropEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
    const dropArea = document.getElementsByClassName('drop-area')[0];
    dropEvents.forEach(eventName => {
        dropArea.addEventListener(eventName, (e)=>{
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // 3. 드레그 영역에 기능 추가
    // 이제 드레그 영영에 대해 drop 이벤트에 함수를 등록함.
    dropArea.addEventListener('drop', function (e) {
        // 이벤트와 함께 dropArea도 전달
        handleDrop(e, dropArea);
    }, false);

    function handleDrop(e, dropArea) {
        const dropX = e.clientX;
        const dropY = e.clientY;
        const files = e.dataTransfer.files;
        // FileList를 배열로 변환
        // forEach 를 쓰려면 아래처럼 배열로 전환해서 쓰거나
        // let files = [...files] 이렇게 배열 형식으로 다시 저장해야함.
        Array.from(files).forEach(file =>
            previewFile(file, dropArea, dropX, dropY)
        );
    }

    function previewFile(file, dropArea, dropX, dropY) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            const container = document.createElement('div');
            container.className = 'dragable';

            const img = document.createElement('img');
            img.src = reader.result;
            img.onload = function () {

                // 드롭다운된 위치에 이미지 붙여넣기
                positionImg(dropArea, img, dropX, dropY)
                addUploadBtn()
                dropArea.appendChild(container);
                container.insertBefore(img, container.firstChild)

                // 특정 좌표에 이밎를 위치 시키는 함수
                function positionImg(dropArea, img, pos_x, pos_y){
                    // dropArea.appendChild(container);
                    // container.appendChild(img);

                    // 이미지의 크기를 기준으로 드롭된 위치에서 이미지를 중앙에 배치합니다.
                    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 100;
                    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 100;
                    const imgWidth = img.offsetWidth;
                    const imgHeight = img.offsetHeight;

                    // dropArea의 상대적 위치를 계산합니다.
                    const dropAreaRect = dropArea.getBoundingClientRect();
                    const relativeX = pos_x - dropAreaRect.left - (imgWidth / 2);
                    const relativeY = pos_y - dropAreaRect.top - (imgHeight / 2);

                    // 이미지 위치를 설정합니다.
                    container.style.position = 'absolute';
                    container.style.left = `${relativeX / vw}vw`;
                    container.style.top = `${relativeY / vh}vh`;
                }

                // 버튼을 만들고 이벤트에 등록하는 함수
                function addUploadBtn(){
                    // 등록 버튼을 생성하고 설정합니다.
                    const btn = document.createElement('button');

                    // container.insertBefore(btn, container.firstChild) // 맨 앞으로 추가
                    container.appendChild(btn); // 맨 뒤로 추가

                    container.child
                    btn.textContent = '등록';
                    btn.className = 'register-button';
                    btn.style.position = 'absolute'

                    // 버튼 클릭 이벤트 핸들러 추가 (예시)
                    btn.addEventListener('click', function () {
                        // 이미지 컨테이너 div를 참조
                        const imgContainer = this.parentNode;
                        const left = imgContainer.style.left;
                        const top = imgContainer.style.top;

                        // 이제 sendImageDataToServer 함수를 호출하여 이미지 데이터와 위치 정보를 전송합니다.
                        console.log('이미지 등록 처리');
                        sendImageDataToServer(file, left, top);
                    });
                }
            };
        }
    }
});
