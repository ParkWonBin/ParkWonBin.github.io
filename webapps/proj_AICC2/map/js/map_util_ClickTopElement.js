document.addEventListener('touchend', function(e) {
    const e_target = e.changedTouches  ? e.changedTouches [0] : e
    selectImage(e_target);
})
document.addEventListener('click', function(e) {
    selectImage(e);
})

const selectImage = (e) => {
    // 클릭 위치에 있는 최상단의 요소를 찾습니다.
    const topElement = document.elementFromPoint(e.clientX, e.clientY);

    // 찾은 요소에 대한 조작을 수행합니다.
    if (topElement.parentNode) {
        // alert(JSON.stringify(topElement.parentNode.getAttributeNames()))

        // imageHotSpot를 클릭한 게 아니라면 return
        if (!topElement.parentNode.getAttribute('class').includes('imageHotSpot')) {
            return null
        }

        // 이미 Active 클라스를 갖고있다면 return
        if (topElement.parentNode.getAttribute('class').includes('Active')) {
            return null
        }

        ////////////////////////////////
        // alert('갱신/삭제 버튼 생성 ')
        const imgContainder = topElement.parentNode
        // 이미 [이동/삭제]버튼 있는지 구분하기 위해 임시로 'Active' 클래스를 추가합니다.
        imgContainder.classList.add('Active')
        // [이동/삭제]버튼 컨테이너 생성
        createBtnContainer(imgContainder);
    }
}