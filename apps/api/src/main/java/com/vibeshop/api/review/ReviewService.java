package com.vibeshop.api.review;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.IntStream;

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

    private static final Comparator<ProductReview> NEWEST_ORDER = Comparator
        .comparing(ProductReview::getCreatedAt, Comparator.reverseOrder())
        .thenComparing(ProductReview::getId, Comparator.reverseOrder());

    private static final Comparator<ProductReview> HIGHEST_RATING_ORDER = Comparator
        .comparing(ProductReview::getRating, Comparator.reverseOrder())
        .thenComparing(ProductReview::getCreatedAt, Comparator.reverseOrder())
        .thenComparing(ProductReview::getId, Comparator.reverseOrder());

    private static final Comparator<ProductReview> LOWEST_RATING_ORDER = Comparator
        .comparing(ProductReview::getRating)
        .thenComparing(ProductReview::getCreatedAt, Comparator.reverseOrder())
        .thenComparing(ProductReview::getId, Comparator.reverseOrder());

    private static final Comparator<ProductReview> HELPFUL_ORDER = Comparator
        .comparing(ProductReview::getHelpfulCount, Comparator.reverseOrder())
        .thenComparing(ProductReview::getCreatedAt, Comparator.reverseOrder())
        .thenComparing(ProductReview::getId, Comparator.reverseOrder());

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CustomerOrderLineRepository customerOrderLineRepository;
    private final ReviewHelpfulVoteRepository reviewHelpfulVoteRepository;

    public ReviewService(
        ProductReviewRepository productReviewRepository,
        ProductRepository productRepository,
        UserRepository userRepository,
        CustomerOrderLineRepository customerOrderLineRepository,
        ReviewHelpfulVoteRepository reviewHelpfulVoteRepository
    ) {
        this.productReviewRepository = productReviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.customerOrderLineRepository = customerOrderLineRepository;
        this.reviewHelpfulVoteRepository = reviewHelpfulVoteRepository;
    }

    @Transactional(readOnly = true)
    public ProductReviewSnapshot getProductReviewSnapshot(Long productId, Long viewerUserId) {
        return buildProductReviewSnapshot(productId, viewerUserId, "newest", null, false);
    }

    @Transactional(readOnly = true)
    public ProductReviewListResponse getProductReviews(Long productId, Long viewerUserId, String sort, Integer rating, boolean photoOnly) {
        getProduct(productId);
        ProductReviewSnapshot snapshot = buildProductReviewSnapshot(productId, viewerUserId, sort, rating, photoOnly);
        return new ProductReviewListResponse(
            snapshot.summary(),
            snapshot.reviews(),
            snapshot.canWriteReview(),
            snapshot.hasReviewed()
        );
    }

    @Transactional(readOnly = true)
    public List<MyReviewResponse> getMyReviews(Long userId) {
        return productReviewRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
            .map(this::toMyReviewResponse)
            .toList();
    }

    public MyReviewResponse createReview(Long userId, Long productId, CreateReviewRequest request) {
        User user = getUser(userId);
        Product product = getProduct(productId);

        if (productReviewRepository.existsByUser_IdAndProduct_Id(userId, productId)) {
            throw new IllegalArgumentException("이미 이 상품에 대한 리뷰를 작성했습니다.");
        }

        long purchaseCount = customerOrderLineRepository.countPurchasedOrdersForReview(
            userId,
            productId,
            REVIEWABLE_ORDER_STATUSES
        );
        if (purchaseCount < 1) {
            throw new IllegalArgumentException("구매 이력이 있는 회원만 리뷰를 작성할 수 있습니다.");
        }

        OffsetDateTime now = now();
        ProductReview review = new ProductReview(
            product,
            user,
            request.rating(),
            request.title().trim(),
            request.content().trim(),
            normalizeFitTag(request.fitTag()),
            Boolean.TRUE.equals(request.repurchaseYn()),
            request.deliverySatisfaction(),
            request.packagingSatisfaction(),
            ReviewStatus.PUBLISHED,
            0,
            true,
            now,
            now
        );
        review.replaceImages(normalizeImageUrls(request.imageUrls()), now);

        return toMyReviewResponse(productReviewRepository.save(review));
    }

    public MyReviewResponse updateMyReview(Long userId, Long reviewId, UpdateReviewRequest request) {
        ProductReview review = productReviewRepository.findByIdAndUser_Id(reviewId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("리뷰를 찾을 수 없습니다."));

        OffsetDateTime now = now();
        review.updateDetails(
            request.rating(),
            request.title().trim(),
            request.content().trim(),
            normalizeFitTag(request.fitTag()),
            Boolean.TRUE.equals(request.repurchaseYn()),
            request.deliverySatisfaction(),
            request.packagingSatisfaction(),
            now
        );
        review.replaceImages(normalizeImageUrls(request.imageUrls()), now);

        return toMyReviewResponse(review);
    }

    public void deleteMyReview(Long userId, Long reviewId) {
        ProductReview review = productReviewRepository.findByIdAndUser_Id(reviewId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("리뷰를 찾을 수 없습니다."));
        productReviewRepository.delete(review);
    }

    public ReviewHelpfulStateResponse markReviewHelpful(Long userId, Long productId, Long reviewId) {
        ProductReview review = getPublishedProductReview(productId, reviewId);
        if (review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 리뷰에는 도움이 돼요를 누를 수 없습니다.");
        }

        if (!reviewHelpfulVoteRepository.existsByReview_IdAndUser_Id(reviewId, userId)) {
            reviewHelpfulVoteRepository.save(new ReviewHelpfulVote(review, getUser(userId), now()));
        }
        syncHelpfulCount(review);

        return new ReviewHelpfulStateResponse(reviewId, review.getHelpfulCount(), true);
    }

    public ReviewHelpfulStateResponse unmarkReviewHelpful(Long userId, Long productId, Long reviewId) {
        ProductReview review = getPublishedProductReview(productId, reviewId);
        reviewHelpfulVoteRepository.findByReview_IdAndUser_Id(reviewId, userId)
            .ifPresent(reviewHelpfulVoteRepository::delete);
        syncHelpfulCount(review);

        return new ReviewHelpfulStateResponse(reviewId, review.getHelpfulCount(), false);
    }

    @Transactional(readOnly = true)
    public List<AdminReviewResponse> getAdminReviews(String status, String keyword) {
        String normalizedKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
        ReviewStatus filterStatus = parseStatus(status, false);

        return productReviewRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(review -> filterStatus == null || review.getStatus() == filterStatus)
            .filter(review -> normalizedKeyword.isBlank() || buildSearchableText(review).contains(normalizedKeyword))
            .map(this::toAdminReviewResponse)
            .toList();
    }

    public AdminReviewResponse updateReviewStatus(Long reviewId, UpdateAdminReviewStatusRequest request) {
        ProductReview review = productReviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("리뷰를 찾을 수 없습니다."));
        review.changeStatus(parseStatus(request.status(), true), now());
        return toAdminReviewResponse(review);
    }

    @Transactional(readOnly = true)
    public long countByUserId(Long userId) {
        return productReviewRepository.countByUser_Id(userId);
    }

    private ProductReviewSnapshot buildProductReviewSnapshot(
        Long productId,
        Long viewerUserId,
        String sort,
        Integer rating,
        boolean photoOnly
    ) {
        List<ProductReview> publishedReviews = productReviewRepository
            .findByProduct_IdAndStatusOrderByCreatedAtDesc(productId, ReviewStatus.PUBLISHED);
        ReviewSummaryResponse summary = toReviewSummary(publishedReviews);

        List<ProductReview> filteredReviews = applyFilters(publishedReviews, rating, photoOnly);
        filteredReviews.sort(resolveSort(sort));

        Set<Long> helpfulVotedReviewIds = resolveHelpfulVotedReviewIds(viewerUserId, filteredReviews);
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
            summary,
            filteredReviews.stream()
                .map(review -> toProductReviewResponse(review, helpfulVotedReviewIds.contains(review.getId())))
                .toList(),
            canWriteReview,
            hasReviewed
        );
    }

    private List<ProductReview> applyFilters(List<ProductReview> reviews, Integer rating, boolean photoOnly) {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("별점 필터는 1점부터 5점까지만 지원합니다.");
        }

        return reviews.stream()
            .filter(review -> rating == null || review.getRating() == rating)
            .filter(review -> !photoOnly || review.hasPhotos())
            .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }

    private Comparator<ProductReview> resolveSort(String sort) {
        String normalizedSort = sort == null || sort.isBlank() ? "newest" : sort.trim().toLowerCase(Locale.ROOT);
        return switch (normalizedSort) {
            case "highest-rating", "rating-high", "rating-desc" -> HIGHEST_RATING_ORDER;
            case "lowest-rating", "rating-low", "rating-asc" -> LOWEST_RATING_ORDER;
            case "helpful" -> HELPFUL_ORDER;
            default -> NEWEST_ORDER;
        };
    }

    private Set<Long> resolveHelpfulVotedReviewIds(Long viewerUserId, List<ProductReview> reviews) {
        if (viewerUserId == null || reviews.isEmpty()) {
            return Set.of();
        }

        return Set.copyOf(reviewHelpfulVoteRepository.findReviewIdsByUserIdAndReviewIds(
            viewerUserId,
            reviews.stream().map(ProductReview::getId).toList()
        ));
    }

    private ReviewSummaryResponse toReviewSummary(List<ProductReview> reviews) {
        long reviewCount = reviews.size();
        double averageRating = roundOne(reviewCount == 0
            ? 0.0
            : reviews.stream().mapToInt(ProductReview::getRating).average().orElse(0.0));
        long photoReviewCount = reviews.stream().filter(ProductReview::hasPhotos).count();
        long buyerReviewCount = reviews.stream().filter(ProductReview::isBuyerReview).count();
        double repurchaseRatio = roundOne(reviewCount == 0
            ? 0.0
            : (reviews.stream().filter(ProductReview::isRepurchaseYn).count() * 100.0) / reviewCount);

        Double deliveryAverage = averageOptional(
            reviews.stream().map(ProductReview::getDeliverySatisfaction).filter(java.util.Objects::nonNull).toList()
        );
        Double packagingAverage = averageOptional(
            reviews.stream().map(ProductReview::getPackagingSatisfaction).filter(java.util.Objects::nonNull).toList()
        );

        List<ReviewRatingBreakdownResponse> ratingDistribution = IntStream.rangeClosed(1, 5)
            .map(rating -> 6 - rating)
            .mapToObj(currentRating -> {
                long count = reviews.stream().filter(review -> review.getRating() == currentRating).count();
                double percentage = reviewCount == 0 ? 0.0 : roundOne((count * 100.0) / reviewCount);
                return new ReviewRatingBreakdownResponse(currentRating, count, percentage);
            })
            .toList();

        return new ReviewSummaryResponse(
            averageRating,
            reviewCount,
            photoReviewCount,
            buyerReviewCount,
            repurchaseRatio,
            deliveryAverage,
            packagingAverage,
            ratingDistribution
        );
    }

    private Double averageOptional(Collection<Integer> values) {
        if (values.isEmpty()) {
            return null;
        }
        return roundOne(values.stream().mapToInt(Integer::intValue).average().orElse(0.0));
    }

    private ProductReviewResponse toProductReviewResponse(ProductReview review, boolean helpfulVoted) {
        return new ProductReviewResponse(
            review.getId(),
            review.getRating(),
            review.getTitle(),
            review.getContent(),
            review.getUser().getName(),
            review.isBuyerReview(),
            review.getFitTag(),
            review.isRepurchaseYn(),
            review.getDeliverySatisfaction(),
            review.getPackagingSatisfaction(),
            review.getHelpfulCount(),
            helpfulVoted,
            review.hasPhotos(),
            review.getImages().stream().map(this::toReviewImageResponse).toList(),
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
            review.getFitTag(),
            review.isRepurchaseYn(),
            review.getDeliverySatisfaction(),
            review.getPackagingSatisfaction(),
            review.getHelpfulCount(),
            review.isBuyerReview(),
            review.getImages().stream().map(this::toReviewImageResponse).toList(),
            review.getStatus().name(),
            review.getCreatedAt(),
            review.getUpdatedAt()
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
            review.getFitTag(),
            review.isRepurchaseYn(),
            review.getDeliverySatisfaction(),
            review.getPackagingSatisfaction(),
            review.isBuyerReview(),
            review.getHelpfulCount(),
            review.getImages().size(),
            review.getStatus().name(),
            review.getCreatedAt(),
            review.getUpdatedAt()
        );
    }

    private ReviewImageResponse toReviewImageResponse(ReviewImage image) {
        return new ReviewImageResponse(image.getId(), image.getImageUrl(), image.getDisplayOrder());
    }

    private String buildSearchableText(ProductReview review) {
        return (
            safe(review.getProduct().getName())
                + " "
                + safe(review.getUser().getName())
                + " "
                + safe(review.getUser().getEmail())
                + " "
                + safe(review.getTitle())
                + " "
                + safe(review.getContent())
                + " "
                + safe(review.getFitTag())
        ).toLowerCase(Locale.ROOT);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private void syncHelpfulCount(ProductReview review) {
        review.syncHelpfulCount((int) reviewHelpfulVoteRepository.countByReview_Id(review.getId()));
    }

    private ProductReview getPublishedProductReview(Long productId, Long reviewId) {
        ProductReview review = productReviewRepository.findByIdAndProduct_Id(reviewId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("리뷰를 찾을 수 없습니다."));
        if (review.getStatus() != ReviewStatus.PUBLISHED) {
            throw new ResourceNotFoundException("공개된 리뷰를 찾을 수 없습니다.");
        }
        return review;
    }

    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("상품 정보를 찾을 수 없습니다."));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("회원 정보를 찾을 수 없습니다."));
    }

    private ReviewStatus parseStatus(String rawStatus, boolean required) {
        if (rawStatus == null || rawStatus.isBlank()) {
            if (required) {
                throw new IllegalArgumentException("리뷰 상태를 입력해 주세요.");
            }
            return null;
        }

        try {
            return ReviewStatus.valueOf(rawStatus.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("지원하지 않는 리뷰 상태입니다.");
        }
    }

    private String normalizeFitTag(String fitTag) {
        if (fitTag == null) {
            return null;
        }
        String normalized = fitTag.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private List<String> normalizeImageUrls(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return List.of();
        }

        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String imageUrl : imageUrls) {
            if (imageUrl == null) {
                continue;
            }
            String trimmed = imageUrl.trim();
            if (!trimmed.isEmpty()) {
                normalized.add(trimmed);
            }
            if (normalized.size() == 4) {
                break;
            }
        }

        return List.copyOf(normalized);
    }

    private double roundOne(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(SEOUL);
    }

    public record ProductReviewSnapshot(
        ReviewSummaryResponse summary,
        List<ProductReviewResponse> reviews,
        boolean canWriteReview,
        boolean hasReviewed
    ) {
    }
}
