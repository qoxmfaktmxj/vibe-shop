package com.vibeshop.api.review;

import jakarta.validation.constraints.NotBlank;

public record UpdateAdminReviewStatusRequest(
    @NotBlank(message = "리뷰 상태를 입력해 주세요.") String status
) {
}
