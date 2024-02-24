function sendImageDataToServer(file, left, top) {
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
    // 기본적으로 로드된 이미지에 대해서는 dragstart 이벤트를 제거함
    var ElementImages = document.querySelectorAll('img');
    // 각 이미지에 대해 이벤트 리스너 추가
    ElementImages.forEach(function (img) {
        img.addEventListener('dragstart', function (e) {
            e.preventDefault(); // 드래그 시작 이벤트의 기본 동작을 방지
        });
    });

    const dropEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
    const dropAreas = document.getElementsByClassName('drop-area');

    Array.from(dropAreas).forEach(dropArea => { // dropAreas를 배열로 변환
        dropEvents.forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        dropArea.addEventListener('drop', function (e) {
            handleDrop(e, dropArea); // 이벤트와 함께 dropArea도 전달
        }, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e, dropArea) { // dropArea 인자 추가
        var files = e.dataTransfer.files;

        // 드롭 위치를 얻습니다.
        const dropX = e.clientX;
        const dropY = e.clientY;

        handleFiles(files, dropArea, dropX, dropY);
    }

    function handleFiles(files, dropArea, dropX, dropY) {
        files = [...files];
        files.forEach(file => previewFile(file, dropArea, dropX, dropY));
    }

    function previewFile(file, dropArea, dropX, dropY) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            let container = document.createElement('div');
            container.className = 'dragable';

            let img = document.createElement('img');
            img.src = reader.result;
            img.onload = function () {
                // 이미지의 크기를 기준으로 드롭된 위치에서 이미지를 중앙에 배치합니다.
                const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 100;
                const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 100;
                const imgWidth = img.offsetWidth;
                const imgHeight = img.offsetHeight;

                // dropArea의 상대적 위치를 계산합니다.
                const dropAreaRect = dropArea.getBoundingClientRect();
                const relativeX = dropX - dropAreaRect.left - (imgWidth / 2);
                const relativeY = dropY - dropAreaRect.top - (imgHeight / 2);

                // 이미지 위치를 설정합니다.
                container.style.position = 'absolute';
                container.style.left = `${relativeX / vw}vw`;
                container.style.top = `${relativeY / vh}vh`;

                dropArea.appendChild(container);
                container.appendChild(img);

                // 등록 버튼을 생성하고 설정합니다.
                let btn = document.createElement('button');
                btn.textContent = '등록';
                btn.className = 'register-button';
                btn.style.position = 'absolute';

                // 버튼 클릭 이벤트 핸들러 추가 (예시)
                btn.addEventListener('click', function () {
                    console.log('이미지 등록 처리');
                    // 이미지 컨테이너 div를 참조
                    const imgContainer = this.parentNode;
                    // 이미지 파일 객체; 이미 파일 객체를 어딘가에 저장하고 있다고 가정
                    // 예: const file = ...; 여기서 file은 드래그 앤 드롭 또는 파일 입력을 통해 얻은 File 객체입니다.

                    // 파일 객체가 이미 previewFile 함수 내에서 사용 가능하다고 가정합니다.
                    // 파일 객체를 어떻게 관리하고 있는지에 따라 이 부분을 조정해야 할 수 있습니다.

                    const left = imgContainer.style.left;
                    const top = imgContainer.style.top;

                    // 이제 sendImageDataToServer 함수를 호출하여 이미지 데이터와 위치 정보를 전송합니다.
                    sendImageDataToServer(file, left, top);
                });

                container.appendChild(btn);
            };

            // 드래그 시작 시 기본 동작을 방지합니다.
            img.addEventListener('dragstart', e => e.preventDefault());
        }


        // 핸드폰용 함수 추가
        var timer;
        var longPressThreshold = 1000; // 1초

        // 롱 프레스를 감지할 요소에 이벤트 리스너 추가
        document.body.addEventListener('touchstart', function (e) {
            // 타이머 시작
            timer = setTimeout(function () {
                openFileInput()
            }, longPressThreshold);
        }, false);

        // 사용자가 손을 떼거나 움직이면 타이머 초기화
        document.body.addEventListener('touchend', function (e) {
            clearTimeout(timer);
        }, false);

        document.body.addEventListener('touchmove', function (e) {
            clearTimeout(timer);
        }, false);

        function openFileInput() {
            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*'; // 이미지 파일만 선택 가능
            fileInput.style.display = 'none'; // 파일 입력 요소 숨기기

            fileInput.addEventListener('change', function (e) {
                var file1 = e.target.files[0];
                if (file1) {
                    // 파일 선택 후 처리 로직
                    // 예: drop 이벤트 핸들러에 파일 객체 전달
                    handleFiles(file1, dropArea, 0, 0);
                }
            });
        }
    }
});

////////////////////////////////////////////////////////


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