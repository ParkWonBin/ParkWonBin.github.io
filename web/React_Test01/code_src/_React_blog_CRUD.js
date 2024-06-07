// 경고 끄는 명령어
/*eslint-disable*/

import './App.css';
import { useState } from 'react';
// JSX 문법 3가지
// 1. JSX 에서는 className을 사용한다.
// 2. 중괄호 문법(데이터 바인딩) : 변수에 있던 데이터가 jsx안에 표시됨
// 3. style 속성 쓸 때는 object 형식으로 써야한다. (카멜 써야함)

function App() {
  // 1. Data 가져오는 영역 ==============
  const initPostData = [
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

  const sortByTitle = () => {
    let copyPosts = [...posts];
    // 가나다 순서대로 정렬
    copyPosts.sort((a, b) => a.title.localeCompare(b.title));
    setPosts(copyPosts);
  }

  const sortByLike = () => {
    let copyPosts = [...posts];
    // 좋아요 내림차순(큰 순서대로) 정렬
    copyPosts.sort((a, b) => b.like - a.like);
    setPosts(copyPosts);
  }

  // 4. 컴퍼넌트 정의 영역 ============
  // 모달창 정의
  const Modal = (props)=>{
    if(!props.isEditing){
      // 수정 중이 아닐 떄
      const btnEdit = ()=>{props.setIsEditing(true)}
      const btnDelete = () => {
        props.setModal(initModalData)
        props.setPosts(prevPosts => {
          // 제목이 일치하지 않는 게시글만 필터링하여 새 배열을 생성
          return prevPosts.filter(post => post.title !== props.modal.title);
        });
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
        props.setPosts(prevPosts=>{
          props.setIsEditing(false)
          props.setModal(prevData => ({...prevData, visible:false }))
          return prevPosts.map((post) => {
            if(post.title === props.modal.title){
              // 수정전 제목과 일치 건은 수정된 내용으로 표시
              return {...post, title:localTitle, contents:localContents}
            }else{
              // 수정전 제목과 불일치 건은 기존 내용대로 표시
              return post
            }
          })
        })
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
  
  // 4. APP JSX 영역 =====================
  return (
    <div className="App">
      <div className="black-nav">
        {/* style 속성은 객체 형식으로 입력한다. public 경로는 '/'로 시작한다. */}
        <img src="/favicon.ico" style={{
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
      <button onClick={sortByTitle}>가나다 정렬</button>
      <button onClick={sortByLike}>인기순 정렬</button>

      {/* 게시글 생성 */
      // 유의사항 : JSX 내에서 반복문은 map 함수를 통해 사용한다.
        posts.map((post,i)=>{
          // ======== 게시글 별 data 정의 ========
          // modal에 표시할 데이터 생성
          const newModalData = {
            title: post.title, 
            date: post.date,
            contents: post.contents
          }

          // ======== 게시글 별 버튼 기능 정의 ========
          // modal 띄우기 함수 정의 (state 바꾸면 자동으로 생성됨)
          const openModal = ()=>{ 
            setIsEditing(false)
            setModal(prevModalData => ({...newModalData, 
              visible: prevModalData.title === newModalData.title ? !prevModalData.visible : true
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
        newPostVisible? <NewPostForm setPosts={setPosts} setNewPostVisible={setNewPostVisible} /> : null}
    </div>
  );
}

export default App;
