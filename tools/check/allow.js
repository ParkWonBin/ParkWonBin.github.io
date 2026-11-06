// 점검에서 일부러 넘어가는 항목 (이유를 꼭 적는다)
module.exports = {
  // 페이지 JS 오류를 무시할 페이지 → 무시할 오류 메시지 일부
  pageErrors: {
    // '/webapps/예시/': ['ResizeObserver loop'],
  },
  // '본문이 보이지 않음' 검사에서 뺄 선택자 (일부러 투명하게 두는 요소)
  hiddenOk: [],
  // 점검하지 않을 페이지 (앞부분 일치)
  skipPages: [],
};
