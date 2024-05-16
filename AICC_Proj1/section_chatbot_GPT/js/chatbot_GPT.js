async function askToGPT() {
    let API_KEY = $('#chatbotGPT #API_KEY')[0].value
    if (API_KEY === ''){
        alert("API KEY를 입력해주세요")
        return "API KEY를 입력해주세요! <br><a href='https://platform.openai.com/api-keys' target=\"_blank\">OpenAI 바로가기</a>"
    }

    const messages = $("#chatbotGPT #chatGPT-container").children().map(function() {
        return {
            role: $(this).attr('role'), // 'role' 속성의 값을 가져옵니다
            content: $(this).text() // 요소의 텍스트 내용을 가져옵니다
        };
    }).get();

    const response = await $.ajax({
        url: 'https://api.openai.com/v1/chat/completions', // 여기에 서버의 엔드포인트를 지정해야 합니다.
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 1024
        }),
        headers: {
            Authorization: `Bearer ${API_KEY}`  // 서버에서 처리할 경우 이 줄은 필요 없습니다.
        }
    });

    return response.choices[0].message.content;
}


function sendMessageGPT() {
    var messageContainer = document.getElementById('chatGPT-container');
    var newMessageInput = document.getElementById('chatGPT_NewMessage');
    var newMessage = newMessageInput.value.replace(/\n/g, '<br>');
    if (newMessage.trim() !== '') {
        var messageElement = document.createElement('div');
        messageElement.className = 'message user'
        messageElement.setAttribute('role','user')
        messageElement.innerHTML = newMessage;
        messageContainer.appendChild(messageElement);
        newMessageInput.value = '';
        messageContainer.scrollTop = messageContainer.scrollHeight;

        resiveMessageGPT(newMessage)
    }
}
async function resiveMessageGPT(message) {
    console.log(message)
    var messageContainer = document.getElementById('chatGPT-container');
    var messageElement = document.createElement('div');
    messageElement.className = 'message assistant'
    messageElement.innerHTML = '...GPT 응답 기다리는 중...';
    messageElement.setAttribute('role', 'assistant')
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    messageElement.innerHTML = await askToGPT();
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function CreateChatbotGPT(){
    // GPT 채팅방 생성
    let chatbotGPT = $('#chatbotGPT');
    chatbotGPT.hide()
    let chatGPT_Title = $('<div id="chatGPT-title"></div>')
    chatbotGPT.append(chatGPT_Title)
    chatGPT_Title.append($(`<div><strong>ChatGPT API와 연결된 채팅방입니다.</strong><button id="chatGPTClose" >X</button></div>`))
    chatGPT_Title.append($(`<input id="API_KEY" type="text" placeholder="GPT-API key를 입력하세요">`))
    chatbotGPT.append($(`<div id="chatGPT-container"><div class="message assistant" role="assistant">안녕하세요. 무엇을 도와드릴까요?</div></div>`))
    let chatGPT_NewMessageContainer = $('<div id="chatGPT_NewMessageContainer"></div>')
    chatbotGPT.append(chatGPT_NewMessageContainer)
    chatGPT_NewMessageContainer.append($(`<textarea id="chatGPT_NewMessage" placeholder="메시지를 입력하세요..."></textarea>`))
    chatGPT_NewMessageContainer.append($(`<button onclick="sendMessageGPT()">Send</button>`))

    // 채팅방 숨기고 시작

    // GPT 아이콘 생성
    let chatbotGPT_IconContainer = $('#chatbotGPT_IconContainer');
    chatbotGPT_IconContainer.text('GPT API')

    chatbotGPT_IconContainer.on('click',function(){
        chatbotGPT.show()
    })

    $('#chatbotGPT #chatGPTClose').on('click',function(){
        chatbotGPT.hide()
    })


    $('#chatGPT_NewMessage').keypress(function(e){
        if(e.which === 13 && !e.shiftKey){ // 엔터 키가 눌렸고, Shift 키는 눌리지 않았을 때
            sendMessageGPT();
        }
    });
}

$(CreateChatbotGPT)