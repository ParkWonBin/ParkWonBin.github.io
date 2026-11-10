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

// Blob 사진을 img 에 연결 (지울 때 메모리를 돌려주려고 주소를 기억해 둔다)
const setBlobSrc = (img, blob) => {
    img._objectUrl = URL.createObjectURL(blob);
    img.src = img._objectUrl;
}

// 화면에서 장소 하나 지우기
const removeSpotElement = (container) => {
    const img = container.getElementsByTagName('img')[0];
    if (img && img._objectUrl) { URL.revokeObjectURL(img._objectUrl); }
    container.remove();
}

// 저장된 장소 하나를 화면에 그린다 (Read)
const createSpotElement = (spot) => {
    const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));
    const container = createElement({
        tagName : 'div',
        className : 'draggable imageHotSpot',
    })
    // 화면 밖으로 밀려나 다시 잡을 수 없게 되지 않도록 화면 안쪽으로
    container.style.top = `${clamp(spot.top, 0, 90)}vh`;
    container.style.left = `${clamp(spot.left, 0, 90)}vw`;

    const img = document.createElement('img');
    if (spot.src) { img.src = spot.src } // 예시 사진
    else { setBlobSrc(img, new Blob([spot.data], {type: spot.type})) } // 올린 사진
    img.setAttribute('data-id', spot.id);
    container.appendChild(img);
    return container
}

// 지도 위의 장소를 목록대로 다시 그린다
const renderHotSpots = (spots) => {
    const dropArea = document.getElementsByClassName('drop-area')[0];
    Array.from(dropArea.getElementsByClassName('draggable')).forEach(removeSpotElement);
    spots.forEach(spot => dropArea.appendChild(createSpotElement(spot)));
}

// 올린 사진을 저장하기 알맞은 크기로 줄인다 → Promise<Blob>
// 화면에는 작게(12vw × 15vh) 보이므로 긴 변 800px 이면 충분하다. 이미 작은 파일은 그대로 둔다.
const IMAGE_MAX_SIDE = 800;
const prepareImage = (file) => new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') { return resolve(file) } // 벡터는 그대로

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        URL.revokeObjectURL(url);
        const w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) { return resolve(file) }
        const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(w, h));
        if (scale === 1 && file.size <= 300 * 1024) { return resolve(file) }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext('2d');
        // 투명할 수 있는 형식은 webp(안 되면 png)로, 나머지는 흰 바탕 jpeg 로
        const mayBeTransparent = /png|gif|webp|avif/.test(file.type);
        if (!mayBeTransparent) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            // 줄인 쪽이 더 크면(이미 잘 압축된 작은 사진) 원본을 쓴다
            resolve(blob && blob.size < file.size ? blob : file);
        }, mayBeTransparent ? 'image/webp' : 'image/jpeg', 0.85);
    };
    img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('열 수 없는 사진'));
    };
    img.src = url;
});

// 저장 실패 안내 문구
const storeErrorText = (err) =>
    (err && err.name === 'QuotaExceededError') ? '저장 공간이 부족해요' : '저장하지 못했어요';

function createImageConainer(data) {
    const {file, dropX, dropY} = data

    const dropArea = document.getElementsByClassName('drop-area')[0];

    // 저장할 작은 사진은 미리 만들어 둔다. 화면에는 고른 사진을 바로 보여 준다 (아직 저장 전 : [등록] 버튼)
    const prepared = prepareImage(file);

    // 이미지 컨테이너 생성 및 배치
    const container = createElement({
        tagName : 'div',
        className : 'draggable imageHotSpot',
    })
    dropArea.appendChild(container);

    // 이미지 생성 및 배치
    const img = createImg({
        imgContainer : container,
        dropX: dropX,
        dropY: dropY
    })
    setBlobSrc(img, file)
    container.appendChild(img)

    // 열 수 없는 파일이면 치우고 알려 준다
    prepared.catch(() => {
        removeSpotElement(container);
        showStoreMsg('이 사진은 열 수 없어요', true);
    })

    const btnCntainder = createElement({
        tagName : 'div',
        className : 'btnContainer'
    })
    container.appendChild(btnCntainder)

    // 등록버튼 클릭/터치 시 기능
    const createbtnClick = ()=>{
        const imgContainer = container;
        if (imgContainer.dataset.busy) { return } // 두 번 눌러도 한 번만 저장
        imgContainer.dataset.busy = '1';
        // 위치는 사진이 다 뜬 뒤에 정해진다(createImg 의 onload). 그 전에 눌러도 화면에 보이는 자리로 저장되게 기다린다
        const loaded = (img.complete && img.naturalWidth) ? Promise.resolve() : new Promise(done => {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
        });
        // 줄인 이미지와 위치를 이 브라우저에 저장합니다.
        Promise.all([prepared, loaded]).then(([blob]) => request_CreateHotSpot({
            left : imgContainer.style.left,
            top : imgContainer.style.top,
            file : blob
        })).then(id => {
            img.setAttribute('data-id', id);
            // 등록된 장소로 바꾸기 : [등록] → [이동][삭제]
            btnCntainder.remove();
            imgContainer.classList.add('Active');
            createBtnContainer(imgContainer);
            showStoreMsg('등록했어요');
        }).catch(err => {
            if (!imgContainer.isConnected) { return } // 열 수 없는 사진이라 이미 치움
            console.error('등록 실패 :', err);
            showStoreMsg(storeErrorText(err), true);
        }).finally(() => {
            delete imgContainer.dataset.busy;
        });
    }

    // 등록 버튼 만들기
    // (터치로 누르면 브라우저가 click 을 만들어 준다. touchend 까지 달면 두 번 저장된다)
    const btn = createElement({
        tagName: 'button',
        textContent : '등록',
        className : 'register-button',
        onclick :createbtnClick
    })
    btnCntainder.appendChild(btn);
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
            // 지금 위치를 이 브라우저에 저장합니다.
            request_UpdateHotSpot({
                spot_id: imgContainer.getElementsByTagName('img')[0].getAttribute('data-id'),
                top: imgContainer.style.top,
                left: imgContainer.style.left
            }).then(found => {
                showStoreMsg(found ? '위치를 저장했어요' : '저장된 사진을 찾지 못했어요', !found);
            }).catch(err => {
                console.error('위치 저장 실패 :', err);
                showStoreMsg(storeErrorText(err), true);
            })
        }
        // 등록버튼 없으면 이동버튼 만들기
        const btnUpdate = createElement({
            tagName: 'button',
            textContent: '이동',
            className: 'update-button',
            onclick: updateBtnClick
        })
        btnContainder.appendChild(btnUpdate);
    }

    const deleteBtnCLick = ()=>{
        const imgContainer = imgContainder;
        if (imgContainer.dataset.busy) { return }
        const spot_id = imgContainer.getElementsByTagName('img')[0].getAttribute('data-id');
        // 아직 등록하지 않은 사진은 화면에서만 지운다
        if (!spot_id) {
            removeSpotElement(imgContainer);
            showStoreMsg('지웠어요');
            return
        }
        imgContainer.dataset.busy = '1';
        // 이 브라우저에 저장된 장소를 지웁니다.
        request_DeleteHotSpot({
            spot_id: spot_id
        }).then(() => {
            removeSpotElement(imgContainer);
            showStoreMsg('삭제했어요');
        }).catch(err => {
            delete imgContainer.dataset.busy;
            console.error('삭제 실패 :', err);
            showStoreMsg(storeErrorText(err), true);
        });
    }
    // 삭제 버튼 만들기
    const btndelete = createElement({
        tagName: 'button',
        textContent : '삭제',
        className : 'delete-button',
        onclick : deleteBtnCLick
    })
    btnContainder.appendChild(btndelete);

    return btnContainder
}
