// 챗봇과 고객 이름 설정
const CHATBOTNAME = '도우미'
const USERNAME = '고객'

// 챗봇의 대본
// TODO : 나중에 백앤드에서 DB 조회 결과로 대본을 만들 예정. DB로 결과 받았다는 전제 하에 아래 형식으로 개발 완료.
const chatbotDialogDictionary = {
    message : '환영합니다.<br>서대문구 경로당,요양시설 위치 알려드립니다.<br>아래 주제에 대해서 문의해주세요.<br><br>시설을 선택하세요.',
    BtnText : ['경로당', '의료복지시설'],
    '경로당':{
        message: '지역을 선택하세요.',
        BtnText : ['북아현동', '창천동', '홍은동'],
        '북아현동': {
            message: '처음으로 돌아가겠습니까?',
            BtnText : ['처음으로'],
            spotLink : [
                {name: '능안경로당' , link:'https://map.naver.com/p/search/능안경로당'},
                {name: 'AAAA' , link:'https://map.naver.com/p/search/북아현동주민센터'},
                {name: 'BBBB' , link:'https://map.naver.com/p/search/아이디어없다'}
            ]
        },
        '창천동': {
            message: '처음으로 돌아가겠습니까?',
            BtnText : ['처음으로'],
            spotLink : [
                {name: '능안경로당' , link:'https://map.naver.com/p/search/능안경로당'},
                {name: 'AAAA' , link:'https://map.naver.com/p/search/북아현동주민센터'},
                {name: 'BBBB' , link:'https://map.naver.com/p/search/아이디어없다'}
            ]
        },
        '홍은동': {
            message: '처음으로 돌아가겠습니까?',
            BtnText : ['처음으로'],
            spotLink : [
                {name: '능안경로당' , link:'https://map.naver.com/p/search/능안경로당'},
                {name: 'AAAA' , link:'https://map.naver.com/p/search/북아현동주민센터'},
                {name: 'BBBB' , link:'https://map.naver.com/p/search/아이디어없다'}
            ]
        }
    },
    '의료복지시설':{
        message: '지역을 선택하세요.',
        BtnText : ['충정로3가', '연희동', '북가좌동'],
        '충정로3가':{
            message: '처음으로 돌아가겠습니까?',
            BtnText : ['처음으로'],
            spotLink : [
                {name: '능안경로당' , link:'https://map.naver.com/p/search/능안경로당'},
                {name: 'AAAA' , link:'https://map.naver.com/p/search/북아현동주민센터'},
                {name: 'BBBB' , link:'https://map.naver.com/p/search/아이디어없다'}
            ]
        },
        '연희동':{
            message: '처음으로 돌아가겠습니까?',
            BtnText : ['처음으로'],
            spotLink : [
                {name: '능안경로당' , link:'https://map.naver.com/p/search/능안경로당'},
                {name: 'AAAA' , link:'https://map.naver.com/p/search/북아현동주민센터'},
                {name: 'BBBB' , link:'https://map.naver.com/p/search/아이디어없다'}
            ]
        },
        '북가좌동':{
            message: '처음으로 돌아가겠습니까?',
            BtnText : ['처음으로'],
            spotLink : [
                {name: '능안경로당' , link:'https://map.naver.com/p/search/능안경로당'},
                {name: 'AAAA' , link:'https://map.naver.com/p/search/북아현동주민센터'},
                {name: 'BBBB' , link:'https://map.naver.com/p/search/아이디어없다'}
            ]
        }
    }
}

let chatbotCurrentDialog = chatbotDialogDictionary //초기값.
////////////////////////////////////////////////////////
// 화면이 그려질 때 설정.
document.addEventListener('DOMContentLoaded',()=>{
    // 쳇봇의 환영 문구 및 버튼 생성
    chatbotInitMessage()

    // 유저가 입력할 입력창을 만들기
    chatbotInitCreateInputArea()
})
/////////////////////////////////////////////////////////
// 체팅방 화면 이동 및 기본 동작에 해당하는 함수.
// 1. 스크롤 이동
const goScrollEnd = ()=>{
    const chatContainer = $('#chat-container');
    chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
}
// 2. 메시지 추가
const chatbotAppendMessage = (sender, message) => {
    // 챗봇 컨테이너를 받아서 메시지를 작성하는 함수입니다.
    const chatContainer = $('#chat-container');
    chatContainer.append($(`<div><strong>${sender}:</strong> ${message}</div>`));

    // 스크롤 맨 아래로 내리기
    goScrollEnd()
}
// 3. 버튼으로 선택지 보여주기
function chatbotCreateBtnsByText(textArray) {
    // 채팅방을 인식하여 버튼 들어갈 컨테이너를 만들어줍니다.
    const chatContainer = $('#chat-container');
    const buttonsContainer = $('<div class="buttons-container"></div>');
    chatContainer.append(buttonsContainer);

    // 배열로 들어온 선택지들을 button으로 만들어 채팅방에 추가합니다.
    textArray.forEach((text) => {
        const button = $(`<button onclick="chatbotSendMessage('${text}')">${text}</button>`);
        buttonsContainer.append(button);
    });

    // 버튼 만들어준 다음에 줄바꿈 2번은 있어야 행복함.
    buttonsContainer.append($('<br><br>'))
}

const chatbotCreateHyperlink = (linkArray)=>{
    // 채팅방을 인식하여 버튼 들어갈 컨테이너를 만들어줍니다.
    const chatContainer = $('#chat-container');
    const linksContainer = $('<div class="links-container"></div>');
    chatContainer.append(linksContainer);

    // 배열로 들어온 선택지들을 button으로 만들어 채팅방에 추가합니다.
    linkArray.forEach((data) => {
        const button = $(`<a href="${data.link}" target="_blank">${data.name}</a><br>`);
        linksContainer.append(button);
    });

    linksContainer.append($('<br><br><br>'))

}

//////////////////////////////////////////////////////////

// 엔터치거나 전송 눌렀을 떄 실행되는 함수.
// 고객님이 먼전 말하며 쳇봇이 대답함.
const chatbotSendMessage = (userMassage)=>{

    // 우선 고객님의 한마디
    // 입력된 메시지를 USER 이름으로 체팅방 안에 추가한다.
    chatbotAppendMessage(USERNAME,userMassage)

    // 나쁜 사용자가 줄바꿈 넣거나 스페이스바 넣으면 화나니까...
    // 앞뒤 공백문자를 제거한 뒤 대본이랑 비교한다.
    userMassage = userMassage.replace(' ',"").trim()


    // 고객이 순순히 대본에 있는 말을 했는지부터 알아야함.
    if(Object.keys(chatbotCurrentDialog).includes(userMassage)){
        // 다행히 우리 시나리오에 있다.
        chatbotCurrentDialog = chatbotCurrentDialog[userMassage]

        // 바로가기 버튼을 만들어줄 게 있으면 하기
        if(chatbotCurrentDialog.spotLink){
            chatbotCreateHyperlink(chatbotCurrentDialog.spotLink)
        }

        // 챗봇의 말대답할 게 있으면 하기
        if(chatbotCurrentDialog.message){
            chatbotAppendMessage(CHATBOTNAME,chatbotCurrentDialog.message)
        }

        // 만들어줄 버튼이 있으면 만들어주기 :
        if(chatbotCurrentDialog.BtnText){
            chatbotCreateBtnsByText(chatbotCurrentDialog.BtnText)
        }


        // 할 말 다했는데, 더이상 대답할 말이 남지 않았다;;;
        if(!chatbotCurrentDialog.message){
            // 할말 없으면 처음으로 가;;;
            userMassage = '처음으로'
        }

    }

    if(userMassage === '처음으로'){
        // 처음으로 가자고 하면, 대답하기 전에 여백을 좀 넣자.
        $('#chat-container').append($(`<br><br>================<br><br>`));

        // 처음 대화로 돌아가기
        chatbotCurrentDialog = chatbotDialogDictionary

        // 처음 대화로 돌아왔음을 알리고자, 환영인사 한 번 더함.
        // 아래꺼는 쳇봇 처음 켰을 때 돌아가는 쳇봇 환영 문구 쏘는 코드
        chatbotInitMessage()
    }

    // 대답을 했으면 맨 아래로.
    goScrollEnd()
}

//////////////////////////////////////////////////////
// 사용자가 처음 들어왔을 떄, 화면에 기본 값을 그려주는 내용
// 쳇봇 기본 메시지 만들기
const chatbotInitMessage = ()=>{

    // 쳇봇이 첫마디 하고
    chatbotAppendMessage(CHATBOTNAME, chatbotCurrentDialog.message)

    // 버튼도 만들어주고
    chatbotCreateBtnsByText(chatbotCurrentDialog.BtnText)

    // 다음 대답 들을 준비
    // 스크롤 맨 아래로 내리기
    goScrollEnd()
}

// 쳇봇 대화 입력창 만들기
const chatbotInitCreateInputArea = () => {
    // html 바디 테그를 가져옵니다.
    const body = $('body')

    // 입력창 역할을 할 div 태그를 생성하고, body 본문에 추가합니다.
    const inputContainer = $('<div id="input-container"></div>')
    body.append(inputContainer)

    // input 태그를 만들어서 컨테이너 안에 넣습니다.
    const userInput = $('<input type="text" id="user-input" placeholder="메시지를 입력하세요">')
    inputContainer.append(userInput)

    // 전송 버튼도 만들어서 추가합니다.
    const sendBtn = $('<button id="send-btn">전송</button>')
    inputContainer.append(sendBtn);

    // 전송 버튼 클릭 이벤트
    sendBtn.click(function() {
        chatbotSendMessage(userInput.val());
        userInput.val("")
    });

    // 엔터 키 입력 이벤트
    userInput.keypress(function(event) {
        if (event.which === 13) {
            chatbotSendMessage(userInput.val());
            userInput.val("")
        }
    });
}