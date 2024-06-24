const createElement = (data) => {
    const {tagName, id, className, textContent, onclick,touchend, change} = data
    const tag = document.createElement(tagName ? tagName : 'div');

    if(id){tag.id = id}
    if(className){tag.className = className}
    if(textContent){tag.textContent = textContent}
    if(onclick){tag.addEventListener('click',onclick)}
    if(touchend){tag.addEventListener('touchend',touchend)}
    if(change){tag.addEventListener('change', change)}

    return tag
}

const createImg = (data)=> {
    const {imgContainer, dropX, dropY, src} = data

    const img = document.createElement('img');
    if(src){img.src = src}

    // 좌표계산을 위한 노트 확인
    const dropArea = document.getElementsByClassName('drop-area')[0];
    const dropAreaRect = dropArea.getBoundingClientRect();

    img.onload = function () {
        // 이미지가 로드된 시점에서 화면 크기 가져오기
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 100;
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 100;

        // 로드된 이미지의 크기를 상각했을 때 넣을 상대위치
        const x_vw = ( dropX - dropAreaRect.left - (img.offsetWidth / 2) ) /vw;
        const y_vh = ( dropY - dropAreaRect.top - (img.offsetHeight / 2) ) /vh;

        // 이미지 위치를 설정합니다.
        // 기본적으로는 드롭된 위치의 중점에 사진을 배치하나, 화면 밖으로 밀려난 경우, 원점 기준으로 놓기
        imgContainer.style.top = `${y_vh>0? y_vh : 0}vh`;
        imgContainer.style.left = `${x_vw>0? x_vw : 0}vw`;
    };
    return img
}

function createImageConainer(data) {
    const {file, dropX, dropY} = data

    const dropArea = document.getElementsByClassName('drop-area')[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
        // 이미지 컨테이너 생성 및 배치
        const imgContainder = createElement({
            tagName : 'div',
            className : 'draggable imageHotSpot',
        })
        dropArea.appendChild(imgContainder);

        // 이미지 생성 및 배치
        const img = createImg({
            imgContainer : imgContainder,
            src : reader.result,
            dropX: dropX,
            dropY: dropY
        })
        imgContainder.appendChild(img)

        const btnContainder = createElement({
            tagName : 'div',
            className : 'btnContainer'
        })
        imgContainder.appendChild(btnContainder)

        // 등록버튼 클릭/터치 시 기능
        const createbtnClick = ()=>{
            const imgContainer = imgContainder;
            // sendImageDataToServer 함수를 호출하여 이미지 데이터와 위치 정보를 전송합니다.
            request_CreateHotSpot({
                left : imgContainer.style.left,
                top : imgContainer.style.top,
                file : reader.result
            }).then(succeed => {
                // 리턴되는 promis 가 boolean 값이기 때문에, 바로 succeed 로 연결
                if (succeed) {
                    console.log("이미지 업로드 성공");
                    btnContainder.remove()
                    imgContainder.classList.remove('Active')
                } else {
                    console.log("이미지 업로드 실패");
                }
            })
                .catch(error => {
                    console.error("이미지 업로드 중 오류 발생:", error);
                })
                .finally(() => {
                    console.log("이미지 업로드 요청 처리 완료");
                });
        }

        // 등록 버튼 만들기
        const btn = createElement({
            tagName: 'button',
            textContent : '등록',
            className : 'register-button',
            onclick :createbtnClick,
            touchend:createbtnClick
        })
        btnContainder.appendChild(btn);

    }
}

const createBtnContainer = (imgContainder)=>{
    // 버튼 컨테이너 없으면 생성
    const btnContainder =
        (imgContainder.getElementsByClassName('btnContainer').length > 0) ?
            imgContainder.getElementsByClassName('btnContainer')[0] :
            createElement({tagName: 'div',className:'btnContainer'})
    imgContainder.appendChild(btnContainder)

    // 등록 버튼이 존재한다면,이동 버튼을 만들지 않음.
    if (btnContainder.getElementsByClassName('register-button').length === 0) {
        const updateBtnClick = ()=> {
            const imgContainer = imgContainder;
            // sendImageDataToServer 함수를 호출하여 이미지 데이터와 위치 정보를 전송합니다.
            request_UpdateHotSpot({
                spot_id: imgContainer.getElementsByTagName('img')[0].getAttribute('data-id'),
                top: imgContainer.style.top,
                left: imgContainer.style.left,
                src: imgContainer.getElementsByTagName('img')[0].src
            }).then(succeed => {
                    if (succeed) {
                        console.log("이미지 업데이트 성공");
                        btnContainder.remove()
                        imgContainder.classList.remove('Active')
                    } else {
                        console.log("이미지 업데이트 실패");
                    }
                })
                .catch(error => {
                    console.error("이미지 업데이트 중 오류 발생:", error);
                })
                .finally(() => {
                    console.log("이미지 업데이트 요청 처리 완료");
                });

        }
        // 등록버튼 없으면 이동버튼 만들기
        const btnUpdate = createElement({
            tagName: 'button',
            textContent: '이동',
            className: 'update-button',
            onclick: updateBtnClick,
            touchend:updateBtnClick
        })
        btnContainder.appendChild(btnUpdate);
    }

    const deleteBtnCLick = ()=>{
        const imgContainer = imgContainder;
        // sendImageDataToServer 함수를 호출하여 이미지 데이터와 위치 정보를 전송합니다.
        request_DeleteHotSpot({
            spot_id: imgContainer.getElementsByTagName('img')[0].getAttribute('data-id'),
            src: imgContainer.getElementsByTagName('img')[0].src
        }).then(succeed => {
            if (succeed) {
                console.log("이미지 삭제 성공");
                imgContainder.remove()
            } else {
                console.log("이미지 삭제 실패");
            }
        })
            .catch(error => {
                console.error("이미지 삭제 중 오류 발생:", error);
            })
            .finally(() => {
                console.log("이미지 삭제 요청 처리 완료");
            });
    }
    // 삭제 버튼 만들기
    const btndelete = createElement({
        tagName: 'button',
        textContent : '삭제',
        className : 'delete-button',
        onclick : deleteBtnCLick,
        touchend : deleteBtnCLick
    })
    btnContainder.appendChild(btndelete);

    return btnContainder
}