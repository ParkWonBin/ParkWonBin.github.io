// https://programmers.co.kr/learn/courses/30/lessons/42862?language=javascript
// nameof : https://stackoverflow.com/questions/37057211/get-the-name-of-a-variable-like-nameof-operator-in-c

// n	lost	reserve	return
// 5	[2, 4]	[1, 3, 5]	5
// 5	[2, 4]	[3]	4
// 3	[3]	[1]	2

// Array 배열 Print
// function print(Arr_tmp,name=""){ console.log( (name? name+" : " : "")+ "[" + Arr_tmp.join(",") + "]" ) }
var n = 3;
var lost = [3,1,4];
var reserve = [1];

var CanAttend = [0]
for( var i = 0 ; i<n; i++){ CanAttend.push(1) }
for( var i = 0 ; i<lost.length; i++){ CanAttend[lost[i]] --  }
for( var i = 0 ; i<reserve.length; i++){ CanAttend[reserve[i]] ++ }
for( var i = 0 ; i<lost.length; i++){
    if(CanAttend[lost[i]] != 0 ){ break; }
    if(CanAttend[lost[i]-1] > 1 ){ 
        CanAttend[lost[i]-1] --;
        CanAttend[lost[i]] ++;
        break;
    }
    if(CanAttend[lost[i]+1] > 1 ){ 
        CanAttend[lost[i]+1] --;
        CanAttend[lost[i]] ++;
        break;
    } 
}
var result = 0
for( var i = 1; i<n+1; i++){ CanAttend[i]>0 ? result++ : result}
console.log(result)


// function solution(n, lost, reserve) {
//     var answer = 0;    
//     return answer;
// }