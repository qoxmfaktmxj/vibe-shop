package com.vibeshop.api.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.") int rating,
    @NotBlank(message = "리뷰 제목을 입력해 주세요.")
    @Size(max = 120, message = "리뷰 제목은 120자 이하여야 합니다.") String title,
    @NotBlank(message = "리뷰 내용을 입력해 주세요.")
    @Size(max = 2000, message = "리뷰 내용은 2000자 이하여야 합니다.") String content
) {
}
