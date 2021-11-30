// https://programmers.co.kr/learn/courses/30/lessons/42860
// https://ratseno.tistory.com/25

function ChrMoveCnt(chr0){
    return Math.min(chr0.charCodeAt(0)-65, 91-chr0.charCodeAt(0))
}

function GoForward(Str_tmp){
    var result=0
    for(var i=0; i<Str_tmp.length; i++) if(Str_tmp[i] != 0) result = i
    return result
}

function GoBackward(Str_tmp){
    Str_tmp[0] = 0
    return 1 + GoForward(Str_tmp.reverse())
}

function posMoveCnt(Str_tmp){    
    return Math.min( GoBackward(Str_tmp) , GoForward(Str_tmp) )
}

function solution(name) {
    var MoveCnt = name.split("").map(x=> ChrMoveCnt(x))
    console.log(MoveCnt)

    var answer = posMoveCnt(MoveCnt);

    for (var i=0; i<MoveCnt.length;i++) answer += MoveCnt[i]
    return answer;
}

var name1 = "JEROEN"
console.log(ChrMoveCnt(name1))

var MoveCnt = name1.split("").map(x=> ChrMoveCnt(x))
console.log(MoveCnt)
console.log()
console.log(GoBackward(MoveCnt))
console.log(GoForward(MoveCnt))


// console.log('az'.toUpperCase()) // 대문자로
// console.log("AZ".charCodeAt(0)) // 0번째 위치의 아스키값
// console.log("AZ".charCodeAt(1)) // 1번쨰 위치의 아스키값
// console.log(String.fromCharCode(65)) // 65번째 아스키 문자