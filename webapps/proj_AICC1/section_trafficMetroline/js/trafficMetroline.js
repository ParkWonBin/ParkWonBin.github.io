$(document).ready(function() {
    var currentImageIndex = 0;
    var intervalId = null;
    const totalImages = 9; // 총 이미지 수

    function updateImageSizes() {
        const TRAFFIC_IMAGE_Container = $('#trafficMetroline');
        const TRAFFIC_IMAGE_WIDTH = TRAFFIC_IMAGE_Container.width();
        const TRAFFIC_IMAGE_HEIGHT = TRAFFIC_IMAGE_Container.height() - 70;

        $('.traffic_slide_gallery_Image').each(function() {
            $(this).css({
                'width': TRAFFIC_IMAGE_WIDTH + 'px',
                'height': TRAFFIC_IMAGE_HEIGHT + 'px'
            });
        });

        $('#traffic_slide_gallery').css('width', TRAFFIC_IMAGE_WIDTH * totalImages + 'px');

        // 현재 인덱스의 이미지 위치로 이동
        $('#traffic_slide_gallery').css('marginLeft', -currentImageIndex * TRAFFIC_IMAGE_WIDTH + 'px');
    }

    function showImageAtIndex(index) {
        const TRAFFIC_IMAGE_WIDTH = $('#trafficMetroline').width();
        currentImageIndex = index;
        $('#traffic_slide_gallery').animate({'marginLeft': -currentImageIndex * TRAFFIC_IMAGE_WIDTH + 'px'}, 300);
    }

    function traffic_Move() {
        if (currentImageIndex < totalImages - 1) {
            showImageAtIndex(currentImageIndex + 1);
        } else {
            showImageAtIndex(0);
        }
    }

    function traffic_back() {
        if (currentImageIndex > 0) {
            showImageAtIndex(currentImageIndex - 1);
        } else {
            showImageAtIndex(totalImages - 1);
        }
    }

    function traffic_play() {
        if (intervalId === null) {
            intervalId = setInterval(traffic_Move, 1000);
            $('#traffic_playToggle').text('■');
            $('#traffic_playToggle').addClass('BigChar');
        } else {
            clearInterval(intervalId);
            intervalId = null;
            $('#traffic_playToggle').removeClass('BigChar');
            $('#traffic_playToggle').text('▶');
        }
    }

    function CreateTrafficSlider() {
        let trafficContainder = $('#trafficMetroline');

        // 버튼 추가
        let buttonContainer = $(`<div id='trafficMatroline_BtnContainer'></div>`);
        trafficContainder.append(buttonContainer);
        buttonContainer.append($('<button class="traffic_back">◀◀</button>'));
        buttonContainer.append($('<button id="traffic_playToggle" class="traffic_play">▶</button>'));
        buttonContainer.append($('<button class="traffic_move">▶▶</button>'));

        // 슬라이더 추가
        let traffic_gallery_wrap = $('<div id="traffic_gallery_wrap"></div>');
        let traffic_slide_gallery = $('<div id="traffic_slide_gallery"></div>');

        trafficContainder.append(traffic_gallery_wrap);
        traffic_gallery_wrap.append(traffic_slide_gallery);

        for (let i = 1; i <= totalImages; i++) {
            let img = $(`<img class="traffic_slide_gallery_Image" src="src/${i}호선.jpg" alt="사진${i}">`);
            traffic_slide_gallery.append(img);
        }

        updateImageSizes();
    }

    CreateTrafficSlider();

    // 이벤트 핸들러 등록
    $(document).on('click', '.traffic_back', traffic_back);
    $(document).on('click', '.traffic_play', traffic_play);
    $(document).on('click', '.traffic_move', traffic_Move);

    // 윈도우 리사이즈 이벤트 핸들러 등록
    $(window).resize(updateImageSizes);
});
