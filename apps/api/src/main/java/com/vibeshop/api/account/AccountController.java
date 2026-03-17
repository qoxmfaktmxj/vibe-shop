package com.vibeshop.api.account;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibeshop.api.account.AccountDtos.AccountProfileResponse;
import com.vibeshop.api.account.AccountDtos.DeleteShippingAddressResponse;
import com.vibeshop.api.account.AccountDtos.ShippingAddressRequest;
import com.vibeshop.api.account.AccountDtos.ShippingAddressResponse;
import com.vibeshop.api.account.AccountDtos.UpdateProfileRequest;
import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.common.UnauthorizedException;
import com.vibeshop.api.review.MyReviewResponse;
import com.vibeshop.api.review.ReviewService;
import com.vibeshop.api.wishlist.WishlistDtos.WishlistProductResponse;
import com.vibeshop.api.wishlist.WishlistDtos.WishlistStateResponse;
import com.vibeshop.api.wishlist.WishlistService;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private static final String AUTH_SESSION_COOKIE = "vibe_shop_session";

    private final AccountService accountService;
    private final AuthService authService;
    private final WishlistService wishlistService;
    private final ReviewService reviewService;

    public AccountController(
        AccountService accountService,
        AuthService authService,
        WishlistService wishlistService,
        ReviewService reviewService
    ) {
        this.accountService = accountService;
        this.authService = authService;
        this.wishlistService = wishlistService;
        this.reviewService = reviewService;
    }

    @GetMapping
    AccountProfileResponse profile(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken
    ) {
        return accountService.getProfile(requireAuthenticatedUserId(authSessionToken));
    }

    @PutMapping
    AccountProfileResponse updateProfile(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        return accountService.updateProfile(requireAuthenticatedUserId(authSessionToken), request);
    }

    @GetMapping("/addresses")
    List<ShippingAddressResponse> addresses(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken
    ) {
        return accountService.getAddresses(requireAuthenticatedUserId(authSessionToken));
    }

    @PostMapping("/addresses")
    ShippingAddressResponse createAddress(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @Valid @RequestBody ShippingAddressRequest request
    ) {
        return accountService.createAddress(requireAuthenticatedUserId(authSessionToken), request);
    }

    @PutMapping("/addresses/{addressId}")
    ShippingAddressResponse updateAddress(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long addressId,
        @Valid @RequestBody ShippingAddressRequest request
    ) {
        return accountService.updateAddress(requireAuthenticatedUserId(authSessionToken), addressId, request);
    }

    @DeleteMapping("/addresses/{addressId}")
    DeleteShippingAddressResponse deleteAddress(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long addressId
    ) {
        accountService.deleteAddress(requireAuthenticatedUserId(authSessionToken), addressId);
        return new DeleteShippingAddressResponse(addressId);
    }

    @GetMapping("/wishlist")
    List<WishlistProductResponse> wishlist(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken
    ) {
        return wishlistService.getWishlist(requireAuthenticatedUserId(authSessionToken));
    }

    @PostMapping("/wishlist/items/{productId}")
    WishlistStateResponse addWishlistItem(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long productId
    ) {
        return wishlistService.addWishlistItem(requireAuthenticatedUserId(authSessionToken), productId);
    }

    @DeleteMapping("/wishlist/items/{productId}")
    WishlistStateResponse removeWishlistItem(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        @PathVariable Long productId
    ) {
        return wishlistService.removeWishlistItem(requireAuthenticatedUserId(authSessionToken), productId);
    }

    @GetMapping("/reviews")
    List<MyReviewResponse> reviews(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken
    ) {
        return reviewService.getMyReviews(requireAuthenticatedUserId(authSessionToken));
    }

    private Long requireAuthenticatedUserId(String authSessionToken) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return userId;
    }
}
