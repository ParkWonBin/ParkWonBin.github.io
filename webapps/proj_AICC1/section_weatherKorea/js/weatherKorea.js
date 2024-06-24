var weather_DAY = '월'
var weather_time = '오전'

function weather_DaySelected(selectedDay,dateName){
    document.querySelectorAll('#weatherTitle > button').forEach(button => {
        button.classList.remove('active');
    });
    // 선택된 요일 버튼에 active 클래스 추가
    $(`#${selectedDay}`).addClass('active');

    weather_DAY = dateName;
    weather_setImageSrc(weather_DAY,weather_time)
}

function weather_TimeSelected(timeName){
    weather_time = timeName
    weather_setImageSrc(weather_DAY,weather_time)
}
function weather_setImageSrc(day,time){
    // day : 월화수목금토일
    // time : 오전,오후
    $('#weather_koreaImg').attr('src',`src/전국날씨_${day}_${time}.jpg`)
}

// $("#weather_Mon").on('click',function(){
//     weather_DaySelected('weather_Mon','월')
// })
function CreateweatherKorea(){
    let weatherContainer =  $('#weatherKorea')
    let weather_wrap = $('<div id="weather_wrap"></div>')

    let weatherTitle = $('<div id="weatherTitle"></div>')
    let weatherImgContainer = $('<div id="weather_ImgContainer"></div>')

    weatherContainer.append(weather_wrap)
    weather_wrap.append(weatherTitle)
    weather_wrap.append(weatherImgContainer)

    weatherTitle.append($(`<button id="weather_Mon" class="active" onclick="weather_DaySelected('weather_Mon','월')"> 월 </button>`))
    weatherTitle.append($(`<button id="weather_Tue" onclick="weather_DaySelected('weather_Tue','화')"> 화 </button>`))
    weatherTitle.append($(`<button id="weather_Wed" onclick="weather_DaySelected('weather_Wed','수')"> 수 </button>`))
    weatherTitle.append($(`<button id="weather_Thu" onclick="weather_DaySelected('weather_Thu','목')"> 목 </button>`))
    weatherTitle.append($(`<button id="weather_Fri" onclick="weather_DaySelected('weather_Fri','금')"> 금 </button>`))
    weatherTitle.append($(`<button id="weather_Sat" onclick="weather_DaySelected('weather_Sat','토')"> 토 </button>`))
    weatherTitle.append($(`<button id="weather_Sun" onclick="weather_DaySelected('weather_Sun','일')"> 일 </button>`))

    weatherImgContainer.append($(`<button id="weather_AM" onclick="weather_TimeSelected('오전')">오전</button>`))
    weatherImgContainer.append($(`<button id="weather_PM" onclick="weather_TimeSelected('오후')">오후</button><br>`))
    weatherImgContainer.append($(`<img id="weather_koreaImg" src="src/전국날씨_월_오전.jpg" >`))

}

$(CreateweatherKorea)