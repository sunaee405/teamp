package com.example.team.redirect;

import java.io.IOException;

import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
@WebFilter(urlPatterns = "/**")
public class AjaxFilter implements Filter {

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;

		String rHeader = httpRequest.getHeader("X-Requested-With"); // ajax
		String url = httpRequest.getRequestURI();

		System.out.println(url);
		// 필터 예외 조건
		boolean check = url.startsWith("/api/") || 
		                url.startsWith("/images/") || 
		                url.matches(".*\\..+") || 
		                url.startsWith("/chat") || 
		                url.equals("/favicon.ico") || 
		                url.startsWith("/main-web/") || 
		                url.startsWith("/redirect/") || 
		                url.equals("/") || 
		                url.startsWith("/static/");
		
		if(check) {
			chain.doFilter(request, response);
			return;
		}
		
		// AJAX 요청이 아니고 오류 페이지가 아닌 경우 주소 변경해서 재요청
		if (!"XMLHttpRequest".equals(rHeader) && !url.startsWith("/error")) {
			RequestDispatcher dispatcher = httpRequest.getRequestDispatcher("/redirect" + url);
			dispatcher.forward(request, response); // 요청을 포워딩
		} else {
			chain.doFilter(request, response); // AJAX 요청 또는 오류 페이지인 경우 요청을 계속 진행
		}
	}
}
