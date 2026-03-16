package com.vibeshop.api.cart;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.cart.CartDtos.CartItemResponse;
import com.vibeshop.api.cart.CartDtos.CartResponse;
import com.vibeshop.api.catalog.Product;
import com.vibeshop.api.catalog.ProductRepository;
import com.vibeshop.api.common.ResourceNotFoundException;

@Service
public class CartService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final StoredCartItemRepository storedCartItemRepository;
    private final ProductRepository productRepository;

    public CartService(StoredCartItemRepository storedCartItemRepository, ProductRepository productRepository) {
        this.storedCartItemRepository = storedCartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse get(String sessionToken) {
        if (sessionToken == null || sessionToken.isBlank()) {
            return empty();
        }

        return toResponse(storedCartItemRepository.findAllBySessionTokenOrderByIdAsc(sessionToken));
    }

    @Transactional
    public CartResponse putItem(String sessionToken, Long productId, int quantity) {
        if (quantity < 1) {
            removeItem(sessionToken, productId);
            return get(sessionToken);
        }

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));

        if (product.getStock() < quantity) {
            throw new IllegalArgumentException(product.getName() + " 재고가 부족합니다.");
        }

        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        StoredCartItem cartItem = storedCartItemRepository.findBySessionTokenAndProduct_Id(sessionToken, productId)
            .orElseGet(() -> new StoredCartItem(sessionToken, product, quantity, now));
        cartItem.changeQuantity(quantity, now);
        storedCartItemRepository.save(cartItem);

        return get(sessionToken);
    }

    @Transactional
    public CartResponse removeItem(String sessionToken, Long productId) {
        if (sessionToken == null || sessionToken.isBlank()) {
            return empty();
        }

        storedCartItemRepository.deleteBySessionTokenAndProduct_Id(sessionToken, productId);
        return get(sessionToken);
    }

    @Transactional
    public CartResponse clear(String sessionToken) {
        if (sessionToken == null || sessionToken.isBlank()) {
            return empty();
        }

        storedCartItemRepository.deleteAllBySessionToken(sessionToken);
        return empty();
    }

    public String createSessionToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public CartResponse empty() {
        return new CartResponse(List.of(), 0, BigDecimal.ZERO);
    }

    private CartResponse toResponse(List<StoredCartItem> items) {
        List<CartItemResponse> lines = items.stream()
            .map(item -> new CartItemResponse(
                item.getProduct().getId(),
                item.getProduct().getSlug(),
                item.getProduct().getName(),
                item.getProduct().getPrice(),
                item.getProduct().getAccentColor(),
                item.getProduct().getImageUrl(),
                item.getProduct().getImageAlt(),
                item.getQuantity()
            ))
            .toList();

        int itemCount = lines.stream().mapToInt(CartItemResponse::quantity).sum();
        BigDecimal subtotal = lines.stream()
            .map(line -> line.price().multiply(BigDecimal.valueOf(line.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(lines, itemCount, subtotal);
    }
}
