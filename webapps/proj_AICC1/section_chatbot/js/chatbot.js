const chatbotConversation = {
    botMessage: `코드랩 쳇봇입니다.<br>메뉴 번호를 입력해서 메뉴를 선택하세요.<br>▶ 교통 안내<br>▶ 날씨 안내`,
    botResponse: {
        "교통안내": {
            botMessage: `교통안내를 선택하셨습니다.<br>메뉴 번호를 입력해서 메뉴를 선택하세요.<br>▶ 처음으로<br>▶ 지하철 노선도<br>▶ 지하철 혼잡도<br>▶ 네이버 길찾기`,
            botResponse: {
                "지하철노선도": {botMessage: `지하철 호선 보기를 선택하셨습니다.<br>▶ 아무키나 입력하면 처음으로`, botFunction: "trafficMetroline"},
                "지하철혼잡도": {botMessage: `지하철 실시간 혼잡도 보기를 선택하셨습니다.<br>안내를 시작합니다.  아무키나 입력하면 처음으로`, botFunction: "trafficChart"},
                "네이버길찾기": {botMessage: `네이버 길찾기를 선택하셨습니다.<br>▶ 아무키나 입력하면 처음으로`, botFunction: "trafficNaverSearch"}
            }
        },
        "날씨안내": {
            botMessage: `날씨 안내를 선택하셨습니다.<br>메뉴 번호를 입력해서 메뉴를 선택하세요.<br>▶ 처음으로<br>▶ 요일별 날씨보기.<br>▶ 실시간 날씨보기`,
            botResponse: {
                "요일별날씨": {botMessage: `요일별 날씨 보기를 선택하셨습니다.<br>▶ 아무키나 입력하면 처음으로`, botFunction: "weatherKorea"},
                "실시간날씨": {botMessage: `실시간 날씨 보기를 선택하셨습니다.<br>▶ 아무키나 입력하면 처음으로`, botFunction: "weatherChart"}
            }
        },
    }
}

//html 열자마자 bot이 첫마디 하게 하기
// $(함수) 를 넣으면 HTML 열린 뒤에 해다 함수가 실행됨.
// 여러 실행문을 실행하고 싶으면 $(function(){ 실행문 }) 이렇게 넣으면 됨.
// 그럼 해당 실행문이 묶여서 익명함수(이름없는 함수) 가 생성되고.
// 익명함수가 $()안에 들어가니까 HTML 열리고 나서 해당 내용 수행됨.
let chatMessageContainer;
let chatContext;
let chatInput;
$(InitChatRoom)

function InitChatRoom() {
    // 초기설정
    let chatbot = $('#chatbot')
    // 채팅방 숨기기
    chatbot.hide()

    // 쳇봇 대화방 생성 관려
    chatMessageContainer = $('<div id="chatMessageContainer"></div>');
    chatbot.append($(`<div id="chatTitle"><strong>로고랑 아이콘 들어갈 위치</strong><button id="chatbotClose" >X</button></div>`))
    chatbot.append(chatMessageContainer)

    let chatInputContainer = $(`<div id="chatInputContainer"></div>`);
     chatInput = $(`<textarea id="chatInput" placeholder="메시지를 입력하세요..."></textarea>`)
    let chatSendBtn = $(`<button id="chatSendBtn" onClick="sendMessage()">Send</button>`)

    chatbot.append(chatInputContainer)
    chatInputContainer.append(chatInput)
    chatInputContainer.append(chatSendBtn)

    // 이벤트 등록
    chatInput.keypress(function (e) {
        if (e.which === 13 && !e.shiftKey) {
            // 엔터 키가 눌렸고, Shift 키는 눌리지 않았을 때
            sendMessage();
        }
    });

    // 이벤트 등록 후 초기화
    chatContext = chatbotConversation;
    resiveMessage('초기화')
    
    //쳇봇 아이콘 생성
    let ChatbotIcon =$(`#chatbotIconContainer`)
    ChatbotIcon.append($(`<img id="chatbotIcon" src="src/챗봇아이콘.png" alt="ChatbotIcon">`))

    // 이벤트 등록
    ChatbotIcon.on('click', function() {
        chatbot.show();
        ChatbotIcon.hide()
    });

    // 닫기 버튼
    $('#chatbotClose').on('click',function(){
        chatbot.hide()
        ChatbotIcon.show()
    })

}

function resiveMessage(key) {

    // var messageContainer = document.getElementById('chatbot');
    var messageElement = $(`<div class='message assistant'>...Bot 응답 기다리는 중...</div>`);
    chatMessageContainer.append(messageElement);
    chatMessageContainer[0].scrollTop = chatMessageContainer.prop("scrollHeight");

    // 1초 쉬고 내용 작성
     setTimeout(function() {
        messageElement.html(chatLeftPopContext(key))
        chatMessageContainer[0].scrollTop = chatMessageContainer.prop("scrollHeight");
    }, 500);

}
function chatLeftPopContext(key){
    // 0 입력되면 초기화
    if(key==='초기화'){
        chatContext = chatbotConversation;
        return chatContext.botMessage
    }
    if(!('botResponse' in chatContext)){
        // botResponse 가 없는 노드로 온 경우 아무 키나 입력해도 처음으로
        chatContext = chatbotConversation;
        return chatContext.botMessage
    }
    // 선택지 있다면 수행
    let resultMessage = ""
    if(key in chatContext.botResponse){
        chatContext = chatContext.botResponse[key]
        resultMessage = chatContext.botMessage
    }else{
        resultMessage = `주어진 선택지를 입력해주세요<br>선택지 목록: ${Object.keys(chatbotConversation.botResponse).join(' , ')}`
    }
    return resultMessage
}
function sendMessage() {
    var newMessage = chatInput.val().trim().replace(" ","").replace(/\n/g, '<br>');
    if (newMessage.trim() !== '') {
        let messageElement = $(`<div class='message user'></div>`);
        chatMessageContainer.append(messageElement);
        messageElement.html(newMessage);
        chatInput.val('');
        chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;

        resiveMessage(newMessage)
    }
}