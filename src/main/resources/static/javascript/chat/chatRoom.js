const socket = new WebSocket('ws://localhost:8080/chat'); // 소켓 연결
const memberNum = sessionStorage.getItem('memNo');
$(async function() {
	
	//$('body').css({'width':width, 'height':height});
//	const urlParams = new URLSearchParams(window.location.search);
//	const selMember = urlParams.get('selMember');
	const url = new URL(location.href).searchParams;
	// FormData 객체 생성
	const formData = new FormData();
	// 
	url.forEach((value, key) => {
	  formData.append(key, value); 
	});
	
	//fetch 요청 보내기
	//요청을 보낼 URL
	const roomUrl = '/chatRoom';
	// 요청 옵션
	const options = {
	    method: 'POST',
	    headers: {
			'X-Requested-With': 'XMLHttpRequest', // 필터에서 ajax 요청으로 인식하도록 헤더 설정
	    },
	    body: formData
	};

	// 소켓 연결시 ajax에서 유저 정보로 채팅내역 불러오기
	socket.onopen = () => {
		fetch(roomUrl, options)
	    .then(response => {
 			if (!response.ok) {
	            return response.text().then(text => {
	                throw new Error(text);
	            });
	        }
	        return response.json(); // 응답을 JSON으로 변환
	    })
	    .then(success => {
				$(".chat").attr("data-rNum", success[0].CHA_NO);
				
			const socketSession = JSON.stringify({
					"TYPE"	 : "setSession",
					"CHA_NO" : success[0].CHA_NO,
			});
				
				
			socket.send(socketSession);

			$(".chat").html(
						`<div class="message-container">
						 </div>
						 <div class="type-message">
							<div class="input">
								<input type="text" id="inputBox" placeholder="Type a message">
							</div>
							<button type="button" class="btn btn-success" style="margin: 5px; width: 18%">전송</button>
						 </div>`);
			

			var log = JSON.parse(success[0].CHA_LOG);

			log.forEach(function(data, index) {
				var currMe = data.USERID == memberNum ? "from-me" : "to-me";
				debugger;
				let time = new Date(data.TIME);
				time = String(time.getHours()).padStart(2, '0') + "시" + String(time.getMinutes()).padStart(2, '0') + "분";
				if(currMe === "from-me") {
					sorttxt =  `<span class="time">${time}</span>
						    	<span class="body">${data.TEXT}</span>`;
				} else if(currMe === "to-me") {
					sorttxt =  `<span class="body">${data.TEXT}</span>
								<span class="time">${time}</span>`;
				}
				var text = `
					<div class="message ${currMe}">
						<input type="hidden" class="cuUser" value="${data.USERID}">
						${sorttxt}
					</div>
					`;
					
				$(".message-container").append(text);
			});
			

	    })
	    .catch(error => {
			const em = error.message;
			if (em === "notLogin") {
				if (window.opener && !window.opener.closed) {
                	window.opener.showAlert('로그인 상태가 아닙니다 다시 로그인해주세요');
                	debugger;
	            } else {
	                alert('비정상적인 접근');
	            }
	        } else {
//				
			}
			
			window.close();
	    });
	}
	
	// 소켓에서 채팅 메시지 수신
	socket.onmessage = msg => {
		const data = JSON.parse(msg.data);
		
		var currMe = data.USERID == memberNum ? "from-me" : "to-me";
		let time = new Date(data.TIME);
		
		time = String(time.getHours()).padStart(2, '0') + "시" + String(time.getMinutes()).padStart(2, '0') + "분";
		if(currMe === "from-me") {
			sorttxt =  `<span class="time">${time}</span>
				    	<span class="body">${data.TEXT}</span>`;
		} else if(currMe === "to-me") {
			sorttxt =  `<span class="body">${data.TEXT}</span>
						<span class="time">${time}</span>`;
		}
		
		
		
		var text = `
			<div class="message ${currMe}">
				<input type="hidden" class="cuUser" value="${data.USERID}">
				${sorttxt}
			</div>
			`;
			
			
		$(".message-container").append(text);
	}
	
	

});

// 채팅창 엔터누를시 메시지 전송

$(document).on('keyup', "#inputBox", function(a, b, c, d, e) {
	var str = $(this).val();
	if(str.trim().length == 0) return;
	if(a.originalEvent.key === "Enter") {
		$('.btn-success').trigger('click');
	}
});



$(document).on('click', ".btn-success", function() {
	debugger;
	const chatRoomNo = $(".chat").attr("data-rNum");
	const content = $("#inputBox").val();
	const chatLog = JSON.stringify({
		"TYPE" 		: "chatMessage",
		"USERID" 	: memberNum,
		"TEXT" 		: content,
		"TIME" 		: new Date(),
        "CHA_NO" 	: chatRoomNo
	});
	
	const url = '/updateChat';
	// 요청 옵션
	const options = {
		method: 'POST',
		headers: {
			'X-Requested-With': 'XMLHttpRequest', // 필터에서 ajax 요청으로 인식하도록 헤더 설정
	        'Content-Type': 'application/json' // 요청 데이터 형식
		},
		body: chatLog
	};
	fetch(url, options)
		.then(response => {
 			if (!response.ok) {
	            return response.text().then(text => {
	                throw new Error(text);
	            });
	        }
	        return response.json(); // 응답을 JSON으로 변환
	    })
		.then(success => {
			socket.send(chatLog);
		})
		.catch(error => {
			const em = error.message;
			if (em === "notLogin") {
	           	alert('로그인 상태가 아닙니다 다시 로그인해주세요');
	           	window.close();
	        } else if(em === "failedUpdate") {
				const check = confirm('메시지 업로드 실패.\n 메시지를 다시 전송 하시겠습니까?');
				if(check) $('.btn-success').trigger('click');
			}
		})
		.finally(() => {
			$("#inputBox").val('');
		});
});
