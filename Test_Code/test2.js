// https://programmers.co.kr/learn/courses/30/lessons/72410
// 1단계 new_id의 모든 대문자를 대응되는 소문자로 치환합니다.
// 2단계 new_id에서 알파벳 소문자, 숫자, 빼기(-), 밑줄(_), 마침표(.)를 제외한 모든 문자를 제거합니다.
// 3단계 new_id에서 마침표(.)가 2번 이상 연속된 부분을 하나의 마침표(.)로 치환합니다.
// 4단계 new_id에서 마침표(.)가 처음이나 끝에 위치한다면 제거합니다.
// 5단계 new_id가 빈 문자열이라면, new_id에 "a"를 대입합니다.
// 6단계 new_id의 길이가 16자 이상이면, new_id의 첫 15개의 문자를 제외한 나머지 문자들을 모두 제거합니다.
//      만약 제거 후 마침표(.)가 new_id의 끝에 위치한다면 끝에 위치한 마침표(.) 문자를 제거합니다.
// 7단계 new_id의 길이가 2자 이하라면, new_id의 마지막 문자를 new_id의 길이가 3이 될 때까지 반복해서 끝에 붙입니다.


var new_id = "...!@BaT#*..y.abcdefghijklm...."

function solution(new_id) {
// step1 소문자로
new_id = new_id.toLowerCase()

// step2 특수문자 제거
var str_tmp = ""
for(var i=0 ; i< new_id.length; i++) if ("abcdefghijklmnopqrstuvwxyz0123456789-_.".includes(new_id[i]) ) str_tmp = str_tmp+new_id[i]
new_id = str_tmp

// step3 .. 제거
while(new_id.includes("..")) new_id = new_id.replace("..",".")

// step4 시작이나 끝에 . 제거
while(new_id.length > 0 & new_id[0]=='.') new_id = new_id.substr(1,new_id.length)
while(new_id.length > 0 & new_id[new_id.length-1]=='.') new_id = new_id.substr(0,new_id.length-1) 

//step5 공백이면 "a" 대입
if(new_id.length == 0) new_id = "a"

//step6 첫 15글자 후 마지막(.) 제거
if(new_id.length > 15) new_id = new_id.substr(0,15)
if(new_id[new_id.length-1] == ".") new_id = new_id.substr(0,new_id.length-2)

//step7 2글자 이하이면 마지막 글짜 반복, 3글자 될 떄까지
while(new_id.length < 3) new_id = new_id = new_id[new_id.length-1]

    return new_id;
}