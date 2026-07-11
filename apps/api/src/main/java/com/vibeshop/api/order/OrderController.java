package com.vibeshop.api.order;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CookieValue;

import com.vibeshop.api.auth.AuthService;
import com.vibeshop.api.cart.CartService;
import com.vibeshop.api.common.UnauthorizedException;
import com.vibeshop.api.config.SessionCookieFactory;
import com.vibeshop.api.order.OrderDtos.CheckoutPreviewRequest;
import com.vibeshop.api.order.OrderDtos.CheckoutPreviewResponse;
import com.vibeshop.api.order.OrderDtos.CancelOrderResponse;
import com.vibeshop.api.order.OrderDtos.CreateOrderRequest;
import com.vibeshop.api.order.OrderDtos.CreateOrderResponse;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupRequest;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupResponse;
import com.vibeshop.api.order.OrderDtos.OrderResponse;
import com.vibeshop.api.order.OrderDtos.OrderSummaryResponse;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private static final String CART_SESSION_COOKIE = "vibe_shop_cart";
    private static final String AUTH_SESSION_COOKIE = "vibe_shop_session";
    private static final String GUEST_ORDER_ACCESS_COOKIE = "vibe_shop_guest_order_access";

    private final OrderService orderService;
    private final CartService cartService;
    private final AuthService authService;
    private final SessionCookieFactory sessionCookieFactory;

    public OrderController(
        OrderService orderService,
        CartService cartService,
        AuthService authService,
        SessionCookieFactory sessionCookieFactory
    ) {
        this.orderService = orderService;
        this.cartService = cartService;
        this.authService = authService;
        this.sessionCookieFactory = sessionCookieFactory;
    }

    @PostMapping("/preview")
    CheckoutPreviewResponse preview(@Valid @RequestBody CheckoutPreviewRequest request) {
        return orderService.preview(request);
    }

    @PostMapping
    CreateOrderResponse create(
        @Valid @RequestBody CreateOrderRequest request,
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String sessionToken,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken,
        HttpServletResponse response
    ) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        CreateOrderResponse createdOrder = orderService.create(request, userId);
        if (userId == null) {
            GuestOrderAccessService.AccessGrant accessGrant = orderService.issueGuestAccessForCreatedOrder(
                createdOrder.orderNumber(),
                request.phone()
            );
            addGuestAccessCookie(response, accessGrant.rawToken());
        }
        if ("FAILED".equals(createdOrder.paymentStatus())) {
            return createdOrder;
        }

        if (userId != null) {
            cartService.clearMemberCart(userId);
            return createdOrder;
        }

        if (sessionToken != null && !sessionToken.isBlank()) {
            cartService.clear(sessionToken);
            response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(CART_SESSION_COOKIE, "")
                .httpOnly(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build()
                .toString());
        }
        return createdOrder;
    }

    @PostMapping("/lookup")
    GuestOrderLookupResponse lookup(
        @Valid @RequestBody GuestOrderLookupRequest request,
        HttpServletResponse response
    ) {
        GuestOrderAccessService.AccessGrant accessGrant = orderService.lookup(request);
        addGuestAccessCookie(response, accessGrant.rawToken());
        return accessGrant.response();
    }

    @PostMapping("/{orderNumber}/cancel")
    CancelOrderResponse cancel(
        @PathVariable String orderNumber,
        @CookieValue(value = GUEST_ORDER_ACCESS_COOKIE, required = false) String guestAccessToken,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken
    ) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        return userId != null
            ? orderService.cancelForUser(orderNumber, userId)
            : orderService.cancelGuest(orderNumber, guestAccessToken);
    }

    @GetMapping("/{orderNumber}")
    OrderResponse order(
        @PathVariable String orderNumber,
        @CookieValue(value = GUEST_ORDER_ACCESS_COOKIE, required = false) String guestAccessToken,
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken
    ) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        return userId != null
            ? orderService.getForUser(orderNumber, userId)
            : orderService.getGuest(orderNumber, guestAccessToken);
    }

    @GetMapping
    java.util.List<OrderSummaryResponse> orders(
        @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String authSessionToken
    ) {
        Long userId = authService.resolveAuthenticatedUserId(authSessionToken);
        if (userId == null) {
            throw new UnauthorizedException("로그인 정보가 필요합니다.");
        }
        return orderService.listByUserId(userId);
    }

    private void addGuestAccessCookie(HttpServletResponse response, String rawToken) {
        response.addHeader(
            HttpHeaders.SET_COOKIE,
            sessionCookieFactory.create(
                GUEST_ORDER_ACCESS_COOKIE,
                rawToken,
                GuestOrderAccessService.ACCESS_DURATION
            )
        );
    }
}
