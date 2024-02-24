document.addEventListener('DOMContentLoaded', (event) => {

    //<input type="file" accept="image/*">
    // 요소는 모바일 기기에서 사용자가 터치하면 기본적으로 해당 기기의 사진 라이브러리, 카메라, 또는 파일 시스템에 접근할 수 있는 인터페이스를 제공함
    // 이는 모바일 운영 체제와 브라우저가 자동으로 처리해 주기 때문에, 개발자가 별도로 모바일 특화 기능을 구현하지 않아도 됩니다.

    // 1. 안보이는 input 요소 생성 및 추가
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.style.display = 'none';
    fileInput.accept = 'image/*';
    document.body.appendChild(fileInput);

    // 2. 화면에서 장소추가 버튼 가져와서 이벤트 연동하기.
    const btnAddPicture = document.getElementById('btn_addHotSpot');
    btnAddPicture.addEventListener('click', (e) => {
        fileInput.click(); // 숨겨진 file input을 프로그래매틱하게 클릭합니다.
    });

    // 3. 파일 인식 받으면 요소 추가
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; // 선택된 파일을 가져옵니다.

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file); // 파일을 읽어 Data URL로 변환합니다.
            reader.onload = function(e) {
                const dropArea = document.getElementsByClassName('drop-area')[0];

                const container = document.createElement('div');
                container.className = 'dragable';

                const img = document.createElement('img'); // 새 이미지 엘리먼트를 생성합니다.
                img.src = e.target.result; // 이미지 소스로 파일의 내용을 설정합니다.
                img.onload = function() {

                    // 드롭다운된 위치에 이미지 붙여넣기
                    positionImg(dropArea, img, 0, 0)
                    addUploadBtn()
                    dropArea.appendChild(container);
                    container.insertBefore(img, container.firstChild)

                    // 특정 좌표에 이밎를 위치 시키는 함수
                    function positionImg(dropArea, img, pos_x, pos_y) {
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
                    function addUploadBtn() {
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

                }
            };

            // 처리가 완료된 후 input 요소 리셋
            resetFileInput(fileInput);
            function resetFileInput(input) {
                input.value = '';
            }

        }
    });
});
