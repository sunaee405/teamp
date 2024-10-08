$(document).ready(function() {
	let initialData = [];
	
	let selectedResult = [];
	let selectedSection = [];
	let selectStatus = [];
	let detailList = [];
	
	// 초기 데이터 가져오기 (페이지 로드 시)
	fetchData();
	debugger;
	// 텍스트 수정기능
	class CustomTextEditor {
	      constructor(props) {
	        const el = document.createElement('input');
	        const { maxLength } = props.columnInfo.editor.options;
	        
	        el.type = 'text';
	        el.maxLength = maxLength;
	        el.value = String(props.value);
			
			if (props.value !== ''){
				el.disabled = props.columnInfo.editor.options.disabled;	
			}
			
	        this.el = el;
	      }

	      getElement() {
	        return this.el;
	      }

	      getValue() {
	        return this.el.value;
	      }

	      mounted() {
	        this.el.select();
	      }
    }

    const grid = new tui.Grid({
      el: document.getElementById('grid'),
      scrollX: false,
      bodyHeight: 500,
//      scrollY: false,
      rowHeaders: ['checkbox'],
      columns: [
   	  	{
   	        header: 'REP_NO', // 숨길 NO
   	        name: 'REP_NO',
   	        hidden: true  // 숨기기 설정
   	    },
   	    {
          header: '처리상태',
          name: 'REP_STATUS',
          filter: 'select',
          formatter: 'listItemText',
          editor: {
            type: 'select',
            options: {
              listItems: selectStatus, //동적으로 설정
            }
          }
        },
        {
          header: '신고분류',
          name: 'REP_SECTION',
          filter: 'select',
          formatter: 'listItemText',
          editor: {
            type: 'select',
            options: {
              listItems: selectedSection, //동적으로 설정
            }
          }
        },
   	    {
   	        header: '회원번호', // 숨길 NO
   	        name: 'MEM_NO',
   	    },
   	    {
   	        header: '상품번호', // 숨길 NO
   	        name: 'PRO_NO',
   	    },
        {
          header: '신고내용',
          name: 'REP_CONTENT',
          validation: { required: true },//노란색
          filter: { type: 'text', showApplyBtn: true, showClearBtn: true },
          editor: {
            type: CustomTextEditor,//사용자 정의 편집기
            options: {
			  maxLength: 5000, //글자수 제한
              //disabled: true
            }
          }
        },
        {
          header: '접수 날자',
          name: 'REP_DATE',
          sortable: true,
          rowSpan: true
        },
        {
          header: '처리결과',
          name: 'REP_RESULT',
          filter: 'select',
          formatter: 'listItemText',
          editor: {
            type: 'select',
            options: {
              listItems: selectedResult, //동적으로 설정
            }
          }
        },
      ]
    });
    
    // 행 추가 버튼 클릭 이벤트 처리
    $('#addRowButton').click(function() {
        const currentData = grid.getData();
        // 새 행 추가
        grid.appendRow({ REP_NO: null, NEW_SECTION: '', NEW_NAME: '', NEW_CONTENT: '', NEW_DATE: null });
        // 편집 모드로 전환    
        requestAnimationFrame(() => {
            const indexToEdit = grid.getData().length - 1;
            grid.setEditing(indexToEdit, 'NEW_SECTION');
        });
    });
    
	// 그리드 이벤트 핸들러
    grid.on('beforeChange', ev => {
    	console.log('before change:', ev);
    });
    
    grid.on('afterChange', ev => {
    	console.log('after change:', ev);
    })
    
    // 클릭 이벤트 핸들러
	grid.on('click', (ev) => {
	    const { rowKey, columnName } = ev;
	    const newsNo = grid.getValue(rowKey, 'NEW_NO');
	    if (columnName === 'NEW_NAME' && ev.targetType !== 'columnHeader' && newsNo !== null) { // NEW_NAME 열이 클릭된 경우
	        //const newsNo = grid.getValue(rowKey, 'NEW_NUM');
	        window.location.href = `info?NEW_NO=${newsNo}`;
	    }
	    
	    if (columnName === 'NEW_CONTENT' && ev.targetType !== 'columnHeader') { // 수정할 열
        const currentContent = grid.getValue(rowKey, 'NEW_CONTENT');
        document.getElementById('editTextArea').value = currentContent; // 현재 내용을 텍스트 영역에 표시
        
        // 모달과 오버레이 표시
        document.getElementById('editModal').style.display = 'block';
        document.getElementById('modalOverlay').style.display = 'block';
        
        // 저장 버튼 클릭 이벤트
        document.getElementById('saveEditButton').onclick = function() {
            const newContent = document.getElementById('editTextArea').value;
            grid.setValue(rowKey, 'NEW_CONTENT', newContent); // 그리드에 수정된 내용 반영
            
            // 모달 닫기
            closeModal();
        };
        
        // 취소 버튼 클릭 이벤트
        document.getElementById('cancelEditButton').onclick = closeModal;
    }
	    
	    
	});
	

    
  	// 저장 버튼 클릭 이벤트 처리
    $('#saveButton').click(function() {
        const currentData = grid.getData();
		
		// 수정된 데이터 필터링
    const updatedData = currentData.filter((row, index) => {
		// 인덱스가 초기 데이터 길이 내에 있는지 확인
	    if (index < initialData.length) {
	        const initialRow = initialData[index];
	        // 필드 비교하여 변경된 경우만 필터링
	        return (
	            row.NEW_NO !== null && // 업데이트할 데이터 확인
	            (row.NEW_NAME !== initialRow.NEW_NAME || 
	             row.NEW_CONTENT !== initialRow.NEW_CONTENT || 
	             row.NEW_SECTION !== initialRow.detailCode.DCO_ID)
	        );
	    }
    return false; // 유효하지 않은 인덱스인 경우 false 반환
    });//////
    
		//아이디가 null이 아니면 update
		//const updatedData = currentData.filter((row, index) => row.NEW_NO !== null);
		//아이디가 null인것은 저장
		const newData = currentData.filter((row, index) => row.NEW_NO === null);
		
		const dataToInsert = newData.map(row => ({
			NEW_NO: null,
		    NEW_NAME: row.NEW_NAME,
		    NEW_CONTENT: row.NEW_CONTENT,
		    NEW_DATE: null,
		    detailCode: { ID: row.NEW_SECTION }
		}));
		
		// 필드 체크
		for (let i = 0; i < newData.length; i++) {
	        const row = newData[i];
	        if (row.NEW_SECTION === '' || row.NEW_NAME === '' || row.NEW_CONTENT === '') {
	            alert('모든 필드를 채워야 저장할 수 있습니다. 비어 있는 행이 있습니다.');
	            return;
	        }
	        for(let j = 0; j < detailList.length; j++){
				if(newData[i].NEW_SECTION === detailList[j].DCO_ID){
				dataToInsert[i].detailCode.ID = detailList[j].ID;
				break; // 변환이 완료되면 더 이상 반복할 필요 없음
				}
			}
	        
	    }
	    
		
        // AJAX 요청으로 서버에 INSERT
        $.ajax({
            type: 'POST',
            url: '/admin/news/insert',
            contentType: 'application/json',
            data: JSON.stringify(dataToInsert),
            success: function(response) {
                console.log('INSERT 성공:', response);
                alert('INSERT 성공!');
                fetchData(); // 데이터를 다시 가져오는 함수 호출
            },
            error: function(error) {
                console.error('INSERT 오류:', error);
                alert('INSERT 실패! 오류: ' + error);
            }
        });
        
        const updateList = updatedData.map(row => ({
			NEW_NO: row.NEW_NO,
		    NEW_NAME: row.NEW_NAME,
		    NEW_CONTENT: row.NEW_CONTENT,
		    NEW_DATE: null,
		    detailCode: { ID: row.NEW_SECTION }
		}));
		
		// 수정할 데이터에 대한 중복 체크
	    for (let i = 0; i < updatedData.length; i++) {
	        const row = updatedData[i];
	        if (row.NEW_SECTION === '' || row.NEW_NAME === '' || row.NEW_CONTENT === '') {
	            alert('모든 필드를 채워야 저장할 수 있습니다. 비어 있는 행이 있습니다.');
	            return;
	        }for(let j = 0; j < detailList.length; j++){
				if(updatedData[i].NEW_SECTION === detailList[j].DCO_ID){
				updateList[i].detailCode.ID = detailList[j].ID;
				break; // 변환이 완료되면 더 이상 반복할 필요 없음
				}
				
			}
	    }
   
        // AJAX 요청으로 서버에 업데이트
	    $.ajax({
			
	        type: 'PUT',
	        url: '/admin/news/update', // 데이터 업데이트를 위한 API 엔드포인트
	        contentType: 'application/json',
	        data: JSON.stringify(updateList), // 수정된 데이터 전송
	
	        success: function(response) {
	            console.log('업데이트 성공:', response);
	            alert('업데이트 성공!');
	        },
	        error: function(error) {
	            console.error('업데이트 오류:', error);
	            alert('업데이트 실패! 오류: ' + error);
	        }
	     });
    });
    
    
    //------함수
    
    	// 모달 닫기 함수
	function closeModal() {
	    document.getElementById('editModal').style.display = 'none';
	    document.getElementById('modalOverlay').style.display = 'none';
	}
    
    // DB에서 데이터 가져와서 화면에 뿌리기
	function fetchData() {
		
		const ResultList = [];
		const SectionList = [];
		const StatusList = [];
		
		// 로컬 스토리지에서 데이터 읽기
	    detailList = JSON.parse(localStorage.getItem('detailList'));
	    
	    //처리결과
	    for(let i = 0; i < detailList.length; i++){
			if(detailList[i].subCode.ID === 12){
				ResultList.push({
            	text: `${detailList[i].DCO_ID}(${detailList[i].DCO_VALUE})`, // 표시할 텍스트
            	value: detailList[i].DCO_ID // 실제 값
        		});
			}
		}
		
		// ResultList를 셀렉트 박스의 옵션 형식으로 변환
		selectedResult = ResultList.map(item => ({
		    text: item.text,  // 표시할 텍스트
		    value: item.value  // 실제 값
		}));
		
		//신고 섹션
		for(let i = 0; i < detailList.length; i++){
			if(detailList[i].subCode.ID == 8){
				SectionList.push({
            	text: `${detailList[i].DCO_ID}(${detailList[i].DCO_VALUE})`, // 표시할 텍스트
            	value: detailList[i].DCO_ID // 실제 값
        		});
			}
		}
		// SectionList를 셀렉트 박스의 옵션 형식으로 변환
		selectedSection = SectionList.map(item => ({
		    text: item.text,  // 표시할 텍스트
		    value: item.value  // 실제 값
		}));
		
		//처리상태
		for(let i = 0; i < detailList.length; i++){
			if(detailList[i].subCode.ID == 11){
				StatusList.push({
            	text: `${detailList[i].DCO_ID}(${detailList[i].DCO_VALUE})`, // 표시할 텍스트
            	value: detailList[i].DCO_ID // 실제 값
        		});
			}
		}
		
		// StatusList를 셀렉트 박스의 옵션 형식으로 변환
		selectStatus = StatusList.map(item => ({
		    text: item.text,  // 표시할 텍스트
		    value: item.value  // 실제 값
		}));
	    
	    $.ajax({
	        type: 'GET',
	        url: '/admin/report/list', // 데이터 가져올 API 엔드포인트
	        success: function(response) {
				console.log('서버 응답:', response); // 여기서 응답 데이터 출력
				initialData = response; // 초기 데이터 저장(데이터 수정시 비교)
	            // 데이터를 그리드에 뿌리기
	            grid.resetData(response.map(item => ({
	                REP_NO: item.REP_NO,           
	                MEM_NO: item.members.MEM_NO,
	                PRO_NO: item.product.PRO_NO,
	                REP_CONTENT: item.REP_CONTENT, 
	                REP_RESULT: item.resultDetail.REP_RESULT,
	                REP_RESULT: item.statusDetail.REP_STATUS,
	                REP_SECTION: item.sectionDetail.REP_SECTION,
	                REP_DATE: item.REP_DATE,
	            })));
	        },
	        error: function(error) {
	            console.error('Error fetching data:', error);
	            alert('데이터를 가져오는 데 실패했습니다.'); // 사용자에게 에러 메시지 알림
	        }
	    });
	}
	
	$('#detailButton').click(function(){
		// 페이지 이동
        window.location.href = 'detailCrud'; // 이동할 페이지의 경로로 변경
	});

   
});


