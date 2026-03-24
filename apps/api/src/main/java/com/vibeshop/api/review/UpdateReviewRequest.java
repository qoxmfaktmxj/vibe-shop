package com.vibeshop.api.review;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateReviewRequest(
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.") int rating,
    @NotBlank(message = "리뷰 제목을 입력해 주세요.")
    @Size(max = 120, message = "리뷰 제목은 120자 이하여야 합니다.") String title,
    @NotBlank(message = "리뷰 내용을 입력해 주세요.")
    @Size(max = 2000, message = "리뷰 내용은 2000자 이하여야 합니다.") String content,
    @Size(max = 40, message = "핏 태그는 40자 이하여야 합니다.") String fitTag,
    Boolean repurchaseYn,
    @Min(value = 1, message = "배송 만족도는 1점 이상이어야 합니다.")
    @Max(value = 5, message = "배송 만족도는 5점 이하여야 합니다.") Integer deliverySatisfaction,
    @Min(value = 1, message = "포장 만족도는 1점 이상이어야 합니다.")
    @Max(value = 5, message = "포장 만족도는 5점 이하여야 합니다.") Integer packagingSatisfaction,
    @Size(max = 4, message = "리뷰 이미지는 최대 4장까지 등록할 수 있습니다.")
    List<@NotBlank(message = "리뷰 이미지 URL을 입력해 주세요.") @Size(max = 255, message = "리뷰 이미지 URL은 255자 이하여야 합니다.") String> imageUrls
) {
}
