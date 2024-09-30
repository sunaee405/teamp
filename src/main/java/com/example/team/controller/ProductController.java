package com.example.team.controller;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.example.team.model.ProductEntity;
import com.example.team.service.ProductService;

import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class ProductController {

	@Inject
	private ProductService productService;

//	@GetMapping("/product/registerProduct")
//	public String registerProduct() {
//
//		return "/product/registerProduct";
//	}

	// =================================== 상품 등록 ===================================

	@GetMapping("/getMemNoByMemId")
	@ResponseBody
	public ResponseEntity<Integer> getMemNoByMemId(HttpSession session) {
		String memId = (String) session.getAttribute("MEM_ID");
		System.out.println("memId from session: " + memId);

		if (memId == null) {
			System.out.println("memId is null. User is not logged in.");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
		}

		Integer memNo = productService.getMemNoByMemId(memId);
		System.out.println("memNo from DB: " + memNo);

		if (memNo == null) {
			System.out.println("No memNo found for memId: " + memId);
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		}

		return ResponseEntity.ok(memNo);
	}

	@GetMapping("/getProductCategory")
	@ResponseBody
	public List<Map<String, Object>> getProductCategory() {
		return productService.getProductCategory();
	}

	@GetMapping("/getProductLocation")
	@ResponseBody
	public List<Map<String, Object>> getProductLocation() {
		return productService.getProductLocation();
	}

	@GetMapping("/getProductState")
	@ResponseBody
	public List<Map<String, Object>> getProductState() {
		return productService.getProductState();
	}

	@GetMapping("/getProductType")
	@ResponseBody
	public List<Map<String, Object>> getProductType() {
		return productService.getProductType();
	}

	@GetMapping("/getProductNego")
	@ResponseBody
	public List<Map<String, Object>> getProductNego() {
		return productService.getProductNego();
	}

	@GetMapping("/getProductStatus")
	@ResponseBody
	public List<Map<String, Object>> getProductStatus() {
		return productService.getProductStatus();
	}

	@PostMapping("/insertProduct")
	@ResponseBody
	public ResponseEntity<?> insertProduct(@RequestParam("media") MultipartFile[] media,
			@RequestParam Map<String, String> params) throws Exception {

		// 집
//		String desktopPath = "C:\\Users\\Anibal\\Desktop\\upload";

		// 파일 저장 경로 설정
		String desktopPath = "C:\\Users\\ITWILL\\Desktop\\upload";
		List<String> savedFileNames = new ArrayList<>();

		for (MultipartFile file : media) {
			UUID uuid = UUID.randomUUID();
			String fileName = uuid.toString() + "_" + file.getOriginalFilename();
			FileCopyUtils.copy(file.getBytes(), new File(desktopPath, fileName));
			savedFileNames.add(fileName);
		}

		// 파일명을 ','로 구분한 문자열로 변환하여 params에 추가
		params.put("fileNames", String.join(",", savedFileNames));

		// 서비스 호출
		productService.insertProduct(params);

		// 로직 처리 후
		Map<String, String> response = new HashMap<>();
		response.put("redirectUrl", "/product/listProduct");

		return ResponseEntity.ok(response);
	}

	// =================================== 상품 목록 ===================================

	@GetMapping("/getSortList")
	@ResponseBody
	public List<Map<String, Object>> getSortList() {
		return productService.getSortList();
	}

	@GetMapping("/listProductsSorted")
	@ResponseBody
	public Map<String, Object> listProductsSorted(@RequestParam("page") int page, @RequestParam("size") int size,
			@RequestParam(value = "sortType", defaultValue = "date") String sortType,
			@RequestParam(value = "categoryId", required = false) String categoryId,
			@RequestParam(value = "locationScoId", required = false) String locationScoId,
			@RequestParam(value = "locationDcoId", required = false) String locationDcoId,
			@RequestParam(value = "searchKeyword", required = false) String searchKeyword) {

		return productService.getProductsSorted(page, size, sortType, categoryId, locationScoId, locationDcoId,
				searchKeyword);
	}

	// =================================== 상세 상품 정보
	// ===================================

	@GetMapping("getContentProduct")
	@ResponseBody
	public Map<String, Object> getContentProduct(@RequestParam("proNo") int proNo) {

		productService.updateProViews(proNo);

		return productService.getContentProduct(proNo);
	}

	@GetMapping("/getOtherProductByMemNo")
	@ResponseBody
	public List<ProductEntity> getOtherProductByMemNo(@RequestParam("memNo") Integer memNo) {
		return productService.getProductByMemNo(memNo);
	}

	@GetMapping("/getOtherProductByProCategroy")
	@ResponseBody
	public List<ProductEntity> getOtherProductByProCategroy(@RequestParam("proCategory") String proCategory) {
		return productService.getProductByProCategory(proCategory);
	}

	@PostMapping("/insertLiked")
	@ResponseBody
	public ResponseEntity<?> insertLiked(@RequestParam Map<String, String> params) throws Exception {

		productService.insertLiked(params);
		return ResponseEntity.ok().body("Liked successfully saved!");

	}

	@PostMapping("/deleteLiked")
	@ResponseBody
	public ResponseEntity<?> deleteLiked(@RequestParam Map<String, String> params) {
		productService.deleteLiked(params);
		return ResponseEntity.ok().body("Liked successfully deleted!");
	}

	@GetMapping("/checkLikedStatus")
	@ResponseBody
	public ResponseEntity<?> checkLikedStatus(@RequestParam("memNo") int memNo, @RequestParam("proNo") int proNo) {
		boolean isLiked = productService.isLiked(memNo, proNo);
		return ResponseEntity.ok().body(isLiked);
	}

	// =================================== 상품 정보 수정
	// ===================================

	@PostMapping("/updateProduct")
	@ResponseBody
	public ResponseEntity<?> updateProduct(@RequestParam("media") MultipartFile[] media,
										   @RequestParam Map<String, String> params) throws Exception {
		
		// 집
//		String desktopPath = "C:\\Users\\Anibal\\Desktop\\upload";

		String desktopPath = "C:\\Users\\ITWILL\\Desktop\\upload";
		List<String> savedFileNames = new ArrayList<>();

		// 새로 업로드된 파일 처리
		for (MultipartFile file : media) {
			if (!file.isEmpty()) {
				UUID uuid = UUID.randomUUID();
				String fileName = uuid.toString() + "_" + file.getOriginalFilename();
				FileCopyUtils.copy(file.getBytes(), new File(desktopPath, fileName));
				savedFileNames.add(fileName);
			}
		}

		// 기존에 남겨진 이미지와 새 이미지 합치기
		String remainingImages = params.get("remainingImages");
		String allImages = remainingImages != null ? remainingImages + "," + String.join(",", savedFileNames)
				: String.join(",", savedFileNames);

		// 삭제된 이미지 파일 처리
		String[] deletedImages = params.get("deletedImages").split(",");
		for (String image : deletedImages) {
			if (!image.isEmpty()) {
				File fileToDelete = new File(desktopPath, image);
				if (fileToDelete.exists()) {
					fileToDelete.delete(); // 파일 삭제
				}
			}
		}

		// 상품 수정 처리
		params.put("fileNames", allImages); // 모든 이미지 정보 업데이트
		productService.updateProduct(params);

		Map<String, String> response = new HashMap<>();
		response.put("redirectUrl", "/product/contentProduct?proNo=" + params.get("proNo"));

		return ResponseEntity.ok(response);
	}

}
