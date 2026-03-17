package com.vibeshop.api.wishlist;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.auth.User;
import com.vibeshop.api.auth.UserRepository;
import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.wishlist.WishlistDtos.WishlistProductResponse;
import com.vibeshop.api.wishlist.WishlistDtos.WishlistStateResponse;

@Service
@Transactional
public class WishlistService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(
        WishlistItemRepository wishlistItemRepository,
        UserRepository userRepository,
        ProductRepository productRepository
    ) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Set<Long> getWishlistedProductIds(Long userId, Collection<Long> productIds) {
        if (userId == null || productIds.isEmpty()) {
            return Set.of();
        }

        return wishlistItemRepository.findWishlistedProductIds(userId, productIds).stream()
            .collect(Collectors.toSet());
    }

    @Transactional(readOnly = true)
    public boolean isWishlisted(Long userId, Long productId) {
        return userId != null && wishlistItemRepository.existsByUser_IdAndProduct_Id(userId, productId);
    }

    @Transactional(readOnly = true)
    public List<WishlistProductResponse> getWishlist(Long userId) {
        return wishlistItemRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
            .map(this::toWishlistProductResponse)
            .toList();
    }

    public WishlistStateResponse addWishlistItem(Long userId, Long productId) {
        if (!wishlistItemRepository.existsByUser_IdAndProduct_Id(userId, productId)) {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원 정보를 찾을 수 없습니다."));
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("상품 정보를 찾을 수 없습니다."));
            wishlistItemRepository.save(new WishlistItem(user, product, OffsetDateTime.now(SEOUL)));
        }

        return new WishlistStateResponse(productId, true);
    }

    public WishlistStateResponse removeWishlistItem(Long userId, Long productId) {
        wishlistItemRepository.deleteByUser_IdAndProduct_Id(userId, productId);
        return new WishlistStateResponse(productId, false);
    }

    @Transactional(readOnly = true)
    public long countByUserId(Long userId) {
        return wishlistItemRepository.countByUser_Id(userId);
    }

    private WishlistProductResponse toWishlistProductResponse(WishlistItem item) {
        Product product = item.getProduct();
        return new WishlistProductResponse(
            product.getId(),
            product.getSlug(),
            product.getName(),
            product.getCategory().getSlug(),
            product.getCategory().getName(),
            product.getSummary(),
            product.getPrice(),
            product.getBadge(),
            product.getAccentColor(),
            product.getImageUrl(),
            product.getImageAlt(),
            item.getCreatedAt()
        );
    }
}
