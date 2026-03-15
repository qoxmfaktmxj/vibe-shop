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
import org.springframework.web.bind.annotation.RequestParam;

import com.vibeshop.api.cart.CartService;
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

    private final OrderService orderService;
    private final CartService cartService;

    public OrderController(OrderService orderService, CartService cartService) {
        this.orderService = orderService;
        this.cartService = cartService;
    }

    @PostMapping("/preview")
    CheckoutPreviewResponse preview(@Valid @RequestBody CheckoutPreviewRequest request) {
        return orderService.preview(request);
    }

    @PostMapping
    CreateOrderResponse create(
        @Valid @RequestBody CreateOrderRequest request,
        @CookieValue(value = CART_SESSION_COOKIE, required = false) String sessionToken,
        HttpServletResponse response
    ) {
        CreateOrderResponse createdOrder = orderService.create(request);
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
    GuestOrderLookupResponse lookup(@Valid @RequestBody GuestOrderLookupRequest request) {
        return orderService.lookup(request);
    }

    @PostMapping("/{orderNumber}/cancel")
    CancelOrderResponse cancel(@PathVariable String orderNumber) {
        return orderService.cancel(orderNumber);
    }

    @GetMapping("/{orderNumber}")
    OrderResponse order(@PathVariable String orderNumber) {
        return orderService.get(orderNumber);
    }

    @GetMapping
    java.util.List<OrderSummaryResponse> orders(@RequestParam String phone) {
        return orderService.listByPhone(phone);
    }
}
