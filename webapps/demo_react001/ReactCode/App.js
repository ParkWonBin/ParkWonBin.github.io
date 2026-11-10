// 경고 끄는 명령어
/*eslint-disable*/

import './App.css';
import { useState } from 'react';

// JSX 문법 3가지
// 1. JSX 에서는 className을 사용한다.
// 2. 중괄호 문법(데이터 바인딩) : 변수에 있던 데이터가 jsx안에 표시됨
// 3. style 속성 쓸 때는 object 형식으로 써야한다. (카멜 써야함)

// Base64로 인코딩된 공유 데이터(?data=)를 디코딩 (페이지를 열 때 한 번만)
// - URLSearchParams 는 '+' 를 공백으로 바꾼다. 제목에 '~' 등이 있으면 base64 에 '+' 가 생겨
//   예전엔 빈 화면이 됐다. base64 에는 공백이 없으니 공백을 '+' 로 되돌린다 (예전에 만든 링크 호환).
// - 읽지 못하는 링크면 빈 화면 대신 기본 게시글을 보여준다.
const sharedPosts = (() => {
  const base64Encoded = new URLSearchParams(window.location.search).get('data');
  if (!base64Encoded) return null;
  try {
    // base64 -> ascii
    const base64Decoded = atob(base64Encoded.replace(/ /g, '+'));
    const decodedURIComponent = decodeURIComponent(base64Decoded);
    const parsed = JSON.parse(decodedURIComponent);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    const str = (v) => (v == null ? '' : String(v));
    return parsed
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({ title: str(p.title), date: str(p.date), contents: str(p.contents), like: Number(p.like) || 0 }));
  } catch (e) {
    console.warn('[demo_react001] 공유 주소의 data 를 읽지 못해 기본 글을 보여줍니다.', e);
    return null;
  }
})();

function App() {

  let data = sharedPosts;

  // 1. Data 가져오는 영역 ==============
  // URL query를 통해 데이터 가져왔으면 해당 데이터 사용, 아니면 기본값 사용
  const initPostData = data? data : [
    {title:'패션의류', date:'2024.3.10.',contents:'남성복,여성복,기타등등',like:3},
    {title:'가전제품', date:'2024.3.15.',contents:'냉장고,세탁기,건조기',like:7},
    {title:'반려동물', date:'2024.3.20.',contents:'개,돼지,소,닭,고양이',like:5},
  ]

  const initModalData = {
    visible:false, 
    title:'', 
    date:'',
    contents:''
  }

  // 2. State 저장하는 영역 ==============
  let [posts, setPosts] = useState(initPostData);
  let [modal, setModal] = useState(initModalData);
  let [newPostVisible, setNewPostVisible] = useState(false);
  let [isEditing, setIsEditing] = useState(false);
  let [shareURL, setShareURL] = useState({visible:false, url:''})
  // let [a,b] = useState('test')
  // a : state에 보관했던 자료
  // b : state 변경을 도와주는 함수
  // 변수 놔두고 state 사용하는 이유 : 
  // 갑자기 data가 변경되었을 때 html 다시 그리게 하려고.
  // 주의 state 는 등호로 바꾸지 않는다.
  
  // 3. 버튼 기능 저장하는 영역 ============
  // 유의사항 : state 안에 배열을 넣을 때는 원본 배열을 수정하는 대신 새로운 배열 생성이 좋다.
  // data를 확인하는 과정에서 언패킹을 수행하여 새로운 주소에 배열을 생성하여 사용한다.
  // 왜냐하면 배열은 주소값 기준으로 변수에 저장되는데, state안에 들어가는 배열의 주소변하지 않으면.
  // react는 해당 변수(주소값 위치)가 변하지 않았으므로, (배열 안에 data가 변했음에도) 변동사항이 없는줄 알고 렌더 안함.
  const VisibleToggle_Modal = ()=>{
    setModal(prevModal => ({...prevModal, visible: !prevModal.visible}));
    // setter 내에 함수를 넣으면, 이전에 있던 값을 인자로 사용하여 값을 구성할 수 있음.
    // 이전 값을 스프레드 한 이후에, 특정 key-value만 갱신하는 식으로 사용하면 편함. 
  }
  const VisibleToggle_NewPost = () => {
    setNewPostVisible(!newPostVisible);
  }

  const btnSortByTitle = () => {
    let copyPosts = [...posts];
    // 가나다 순서대로 정렬
    copyPosts.sort((a, b) => a.title.localeCompare(b.title));
    setPosts(copyPosts);
  }

  const btnSortByLike = () => {
    let copyPosts = [...posts];
    // 좋아요 내림차순(큰 순서대로) 정렬
    copyPosts.sort((a, b) => b.like - a.like);
    setPosts(copyPosts);
  }

  const btnShareURL = () => {
    const getBaseURL = () => {
      const url = window.location.href; // 현재 페이지의 전체 URL
      const pathnameIndex = url.indexOf(window.location.pathname); // 패스네임 시작 인덱스
      const endpoint = url.indexOf('?', pathnameIndex); // '?' 쿼리 스트링 시작 인덱스
      return endpoint > -1 ? url.substring(0, endpoint) : url; // '?'가 있으면 쿼리 스트링 이전까지, 없으면 전체 URL
    };
    
    const baseURL = getBaseURL();
    // https://parkwonbin.github.io/React_Test01/
    // 'http://localhost:3000/'

    // state를 url 인코딩 후 base64로 인코딩한다. (ascii -> base64)
    // 바로 bota 실행 시 문자열 범위를 벗어나는 오류가 생기기 때문에
    // uri로 이슈가 될만한 문자열을 모두 변환하고 btoa로 인코딩한다.
    const jsonString = JSON.stringify(posts);
    const encodedURIComponent = encodeURIComponent(jsonString);
    const base64Encoded = btoa(encodedURIComponent);

    // url 로 데이터 내보내기
    // base64 의 '+' '/' '=' 는 주소에서 다른 뜻이 되므로 퍼센트 인코딩한다. ('+' 가 공백으로 읽히던 문제)
    const url = `${baseURL}?data=${encodeURIComponent(base64Encoded)}`;
    setShareURL(prevUrl => ({
      visible : !prevUrl.visible,
      url : url
    }))
    console.log(url)
  }

  // 4. 컴퍼넌트 정의 영역 ============
  // 모달창 정의
  const Modal = (props)=>{
    if(!props.isEditing){
      // 수정 중이 아닐 떄
      const btnEdit = ()=>{props.setIsEditing(true)}
      const btnDelete = () => {
        // 제목으로 찾으면 같은 제목의 다른 글까지 지워지므로, 모달에 담아 둔 그 글(객체)만 뺀다.
        const target = props.modal.post;
        props.setModal(initModalData)
        props.setPosts(prevPosts => prevPosts.filter(post => post !== target));
      };
      
      return (
        <div className='modal'>
          <h4>{props.modal.title}</h4>
          <p>{props.modal.contents}</p>
          <p>{props.modal.date} 발행</p>
          <button onClick={btnEdit}>수정</button>
          <button onClick={btnDelete}>삭제</button>
        </div>
      )
    }else{
      // 수정할 데이터 가져오기
      const [localTitle, setLocalTitle] = useState(props.modal.title);
      const [localContents, setLocalContents] = useState(props.modal.contents);
      // 수정 내용 적용
      const btnEditConfirm = ()=>{
        // 제목이 아니라 모달에 담아 둔 그 글(객체)만 고친다. (같은 제목의 다른 글은 그대로)
        const target = props.modal.post;
        const edited = target ? {...target, title:localTitle, contents:localContents} : null;
        props.setPosts(prevPosts => prevPosts.map(post => post === target ? edited : post))
        props.setIsEditing(false)
        // 모달도 고친 글을 가리키게 한다 ('모달 토글' 로 다시 열면 고친 내용이 보이도록)
        props.setModal(prevData => edited
          ? {...prevData, title:edited.title, contents:edited.contents, post:edited, visible:false}
          : {...prevData, visible:false})
      }
      // 수정 취소 버튼
      const btnEditCencle = ()=>{
        props.setIsEditing(false)
      }
      return (
        <div className='modal'>
          <h3>게시글 수정중</h3>
          <h4>제목 : <input type='text' value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} /> </h4>
          <p>내용 : <textarea value={localContents} onChange={(e) => setLocalContents(e.target.value)} /> </p>
          <button onClick={btnEditConfirm}>등록</button>
          <button onClick={btnEditCencle}>취소</button>
        </div>
      )

    }
  }

  // 새글쓰기 창 정의
  const NewPostForm = (props) => {
    // 로컬 상태로 각 입력 필드의 값을 관리합니다.
    // 바로 상위 state를 수정하게 되면 한 글자 입력할 때마다 화면이 다시 랜더링 되기 때문.
    const date = new Date()
    const dateString = `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()}.`
    const [localTitle, setLocalTitle] = useState('');
    const [localDate, setLocalDate] = useState(dateString);
    const [localContents, setLocalContents] = useState('');
  
    // "등록" 버튼을 클릭했을 때, 로컬 상태를 기반으로 새 포스트를 생성합니다.
    const createPost = () => {
      const newPost = { 
        title: localTitle, 
        date: localDate, 
        contents: localContents,
        like : 0
      }
      props.setPosts([newPost, ...posts]);
      props.setNewPostVisible(false); // 폼을 숨깁니다.
    };

    // 취소 버튼 처리
    const cancleNewPost = () =>{
      props.setNewPostVisible(false)
    }
  
    // 새글 입력 폼 JSX
    return (
      <div className='newPostForm'>
        <h3>게시글 작성</h3>
        <h4>제목 : <input type='text' value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} /> </h4>
        <p>날짜 : <input type='text' value={localDate} onChange={(e) => setLocalDate(e.target.value)} /> </p>
        <p>내용 : <textarea value={localContents} onChange={(e) => setLocalContents(e.target.value)} /> </p>
        <button onClick={createPost}>등록</button>
        <button onClick={cancleNewPost}>취소</button>
      </div>
    );
  };
  
  const ShareForm = (props)=>{
    return (
      <div id='shareForm' style={{position:'absolute',left:'30%',top:'20%',backgroundColor:'lightgray',padding:'10px',border:'2px solid black'}}>
        <h4>공유 URL : </h4>
        <textarea readOnly style={{width:'30vw',height:'30vh'}}>{props.shareURL.url}</textarea>
        <br/>
        <button onClick={()=>{props.setShareURL({visible:false, url: props.shareURL.url})}}>닫기</button>
      </div>
    )
  }

  // 5. APP JSX 영역 =====================
  return (
    <div className="App">
      <div className="black-nav">
        {/* style 속성은 객체 형식으로 입력한다. public 경로는 '/'로 시작한다. */}
        <img src="./favicon.ico" style={{
          width: '40px', 
          height: '40px', 
          borderRadius: '30%', 
          marginRight:'10px'
        }}/>
        <h4 >wbpark blog</h4>
      </div>

      {/* 버튼 생성 */}
      <button onClick={VisibleToggle_NewPost}>글쓰기</button>
      <button onClick={VisibleToggle_Modal}>모달 토글</button>
      <button onClick={btnSortByTitle}>가나다 정렬</button>
      <button onClick={btnSortByLike}>인기순 정렬</button>
      <button onClick={btnShareURL}>공유하기</button>

      {/* 게시글 생성 */
      // 유의사항 : JSX 내에서 반복문은 map 함수를 통해 사용한다.
        posts.map((post,i)=>{
          // ======== 게시글 별 data 정의 ========
          // modal에 표시할 데이터 생성
          const newModalData = {
            title: post.title, 
            date: post.date,
            contents: post.contents,
            post: post // 수정 · 삭제할 글을 제목 대신 이 객체로 찾는다
          }

          // ======== 게시글 별 버튼 기능 정의 ========
          // modal 띄우기 함수 정의 (state 바꾸면 자동으로 생성됨)
          const openModal = ()=>{ 
            setIsEditing(false)
            setModal(prevModalData => ({...newModalData, 
              visible: prevModalData.post === newModalData.post ? !prevModalData.visible : true
            })) 
            // 동일한 게시글을 다시 클릭하면 모달창이 토글되고,
            // 다른 게시글을 클릭하면 해당 게시물을 보여주도록
          }

          // 좋아요 처리 로직 : 배열 복사 사용
          const addLike = (e)=>{
            e.stopPropagation();
            const postsCopy = [...posts]
            postsCopy[i].like = post.like + 1
            setPosts(postsCopy)
          }
          
          // 게시글 표시할 JSX
          return (
            <div className='list' onClick={openModal}>
              <h4>{post.title} <span onClick={addLike} >👍</span> {post.like}</h4>
              <p>{post.date} 발행</p>
            </div>
          )
        })
      }
      
      {/* 유의사항 : JSX 내 조건문은 삼항식을 사용한다 */}
      {/* 모달창 생성 */
        modal.visible? <Modal modal={modal} setModal={setModal} isEditing={isEditing} setIsEditing={setIsEditing} setPosts={setPosts}/> : null
      }
      {/* 새 게시물 생성 창 */
        newPostVisible? <NewPostForm setPosts={setPosts} setNewPostVisible={setNewPostVisible} /> : null
      }
      {/* 공유창 생성 */
        shareURL.visible? <ShareForm shareURL={shareURL} setShareURL={setShareURL} /> : null
      }
    </div>
  );
}

export default App;
