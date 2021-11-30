// https://programmers.co.kr/learn/courses/30/lessons/42862#qna
var n = 5
var lost = [2,4]
var reserve = [1,3,5]

// Init
var CanAttend = []
for(var i=0; i<n; i++) CanAttend.push(1)
for(var i=0; i<lost.length; i++) CanAttend[lost[i]-1]--
for(var i=0; i<reserve.length; i++) CanAttend[reserve[i]-1]++
// console.log(CanAttend.join(","))

// Process
for(var i=0; i<CanAttend.length; i++) {
    if (CanAttend[i]==0 & i>0){ if(CanAttend[i-1]>1){CanAttend[i-1]--; CanAttend[i]++; continue;} }
    if (CanAttend[i]==0 & i<n){ if(CanAttend[i+1]>1){CanAttend[i+1]--; CanAttend[i]++; continue;} }
}
// console.log(CanAttend.join(","))

// End
var answer = 0
for(var i =0; i<CanAttend.length; i++) if(CanAttend[i]>0) answer++
// console.log(answer)

