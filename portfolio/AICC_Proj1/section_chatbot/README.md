## 실시간 상담 챗봇
담당자 : 박원빈(리더)

### 학습목표 
- 간편하게 사용하자가 원하는 정보를 바로 찾을 수 있는 챗봇 서비스 개발
- JSON를 활용해 챗봇 대본 코딩
***
### 학습내용
1. ### STEP1
JSON을 이용해 챗봇 대본 코딩
```js
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

```  
2. ### STEP2
   챗봇에 생동감을 부여하기위해 약간의 딜레이 설정
  
