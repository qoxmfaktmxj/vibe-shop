package com.vibeshop.api.review;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.auth.User;
import com.vibeshop.api.auth.UserRepository;
import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.order.CustomerOrderLineRepository;
import com.vibeshop.api.order.OrderStatus;

@Service
@Transactional
public class ReviewService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final EnumSet<OrderStatus> REVIEWABLE_ORDER_STATUSES = EnumSet.of(
        OrderStatus.PAID,
        OrderStatus.PREPARING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED
    );

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CustomerOrderLineRepository customerOrderLineRepository;

    public ReviewService(
        ProductReviewRepository productReviewRepository,
        ProductRepository productRepository,
        UserRepository userRepository,
        CustomerOrderLineRepository customerOrderLineRepository
    ) {
        this.productReviewRepository = productReviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.customerOrderLineRepository = customerOrderLineRepository;
    }

    @Transactional(readOnly = true)
    public ProductReviewSnapshot getProductReviewSnapshot(Long productId, Long viewerUserId) {
        List<ProductReviewResponse> reviews = productReviewRepository
            .findByProduct_IdAndStatusOrderByCreatedAtDesc(productId, ReviewStatus.PUBLISHED)
            .stream()
            .map(this::toProductReviewResponse)
            .toList();

        long reviewCount = productReviewRepository.countByProduct_IdAndStatus(productId, ReviewStatus.PUBLISHED);
        Double averageRating = productReviewRepository.findAverageRatingByProductIdAndStatus(
            productId,
            ReviewStatus.PUBLISHED
        );

        boolean hasReviewed = viewerUserId != null
            && productReviewRepository.existsByUser_IdAndProduct_Id(viewerUserId, productId);
        boolean canWriteReview = viewerUserId != null
            && !hasReviewed
            && customerOrderLineRepository.existsPurchasedProductForReview(
                viewerUserId,
                productId,
                REVIEWABLE_ORDER_STATUSES
            );

        return new ProductReviewSnapshot(
            new ReviewSummaryResponse(averageRating == null ? 0.0 : averageRating, reviewCount),
            reviews,
            canWriteReview,
            hasReviewed
        );
    }

    @Transactional(readOnly = true)
    public List<MyReviewResponse> getMyReviews(Long userId) {
        return productReviewRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
            .map(this::toMyReviewResponse)
            .toList();
    }

    public MyReviewResponse createReview(Long userId, Long productId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("회원 정보를 찾을 수 없습니다."));
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("상품 정보를 찾을 수 없습니다."));

        if (productReviewRepository.existsByUser_IdAndProduct_Id(userId, productId)) {
            throw new IllegalArgumentException("이미 이 상품에 대한 리뷰를 작성했습니다.");
        }

        boolean purchased = customerOrderLineRepository.existsPurchasedProductForReview(
            userId,
            productId,
            REVIEWABLE_ORDER_STATUSES
        );
        if (!purchased) {
            throw new IllegalArgumentException("구매 이력이 있는 회원만 리뷰를 작성할 수 있습니다.");
        }

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        ProductReview review = productReviewRepository.save(new ProductReview(
            product,
            user,
            request.rating(),
            request.title().trim(),
            request.content().trim(),
            ReviewStatus.PUBLISHED,
            now,
            now
        ));

        return toMyReviewResponse(review);
    }

    @Transactional(readOnly = true)
    public List<AdminReviewResponse> getAdminReviews(String status, String keyword) {
        String normalizedKeyword = keyword == null ? "" : keyword.trim().toLowerCase();
        ReviewStatus filterStatus = parseStatus(status, false);

        return productReviewRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(review -> filterStatus == null || review.getStatus() == filterStatus)
            .filter(review -> {
                if (normalizedKeyword.isBlank()) {
                    return true;
                }

                return (
                    review.getProduct().getName()
                        + " "
                        + review.getUser().getName()
                        + " "
                        + review.getUser().getEmail()
                        + " "
                        + review.getTitle()
                        + " "
                        + review.getContent()
                ).toLowerCase().contains(normalizedKeyword);
            })
            .map(this::toAdminReviewResponse)
            .toList();
    }

    public AdminReviewResponse updateReviewStatus(Long reviewId, UpdateAdminReviewStatusRequest request) {
        ProductReview review = productReviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("리뷰를 찾을 수 없습니다."));
        review.changeStatus(parseStatus(request.status(), true), OffsetDateTime.now(SEOUL));
        return toAdminReviewResponse(review);
    }

    @Transactional(readOnly = true)
    public long countByUserId(Long userId) {
        return productReviewRepository.countByUser_Id(userId);
    }

    private ReviewStatus parseStatus(String rawStatus, boolean required) {
        if (rawStatus == null || rawStatus.isBlank()) {
            if (required) {
                throw new IllegalArgumentException("리뷰 상태를 입력해 주세요.");
            }
            return null;
        }

        try {
            return ReviewStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("지원하지 않는 리뷰 상태입니다.");
        }
    }

    private ProductReviewResponse toProductReviewResponse(ProductReview review) {
        return new ProductReviewResponse(
            review.getId(),
            review.getRating(),
            review.getTitle(),
            review.getContent(),
            review.getUser().getName(),
            review.getCreatedAt()
        );
    }

    private MyReviewResponse toMyReviewResponse(ProductReview review) {
        return new MyReviewResponse(
            review.getId(),
            review.getProduct().getId(),
            review.getProduct().getSlug(),
            review.getProduct().getName(),
            review.getProduct().getImageUrl(),
            review.getProduct().getImageAlt(),
            review.getRating(),
            review.getTitle(),
            review.getContent(),
            review.getStatus().name(),
            review.getCreatedAt()
        );
    }

    private AdminReviewResponse toAdminReviewResponse(ProductReview review) {
        return new AdminReviewResponse(
            review.getId(),
            review.getProduct().getId(),
            review.getProduct().getSlug(),
            review.getProduct().getName(),
            review.getUser().getName(),
            review.getUser().getEmail(),
            review.getRating(),
            review.getTitle(),
            review.getContent(),
            review.getStatus().name(),
            review.getCreatedAt()
        );
    }

    public record ProductReviewSnapshot(
        ReviewSummaryResponse summary,
        List<ProductReviewResponse> reviews,
        boolean canWriteReview,
        boolean hasReviewed
    ) {
    }
}
