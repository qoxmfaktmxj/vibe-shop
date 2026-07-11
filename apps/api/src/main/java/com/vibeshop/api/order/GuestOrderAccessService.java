package com.vibeshop.api.order;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.common.TooManyRequestsException;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupRequest;
import com.vibeshop.api.order.OrderDtos.GuestOrderLookupResponse;

@Service
public class GuestOrderAccessService {

    public static final Duration ACCESS_DURATION = Duration.ofMinutes(20);

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration ATTEMPT_WINDOW = Duration.ofMinutes(15);
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final CustomerOrderRepository customerOrderRepository;
    private final GuestOrderAccessTokenRepository tokenRepository;
    private final GuestOrderAccessAuditLogRepository auditLogRepository;

    public GuestOrderAccessService(
        CustomerOrderRepository customerOrderRepository,
        GuestOrderAccessTokenRepository tokenRepository,
        GuestOrderAccessAuditLogRepository auditLogRepository
    ) {
        this.customerOrderRepository = customerOrderRepository;
        this.tokenRepository = tokenRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(noRollbackFor = ResourceNotFoundException.class)
    public AccessGrant lookup(GuestOrderLookupRequest request) {
        String orderNumber = request.orderNumber().trim();
        String phone = request.phone().trim();
        String requestKeyHash = hash("LOOKUP|" + orderNumber);
        OffsetDateTime now = OffsetDateTime.now(SEOUL);

        enforceRateLimit("LOOKUP", requestKeyHash, now);

        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber).orElse(null);
        if (order == null || order.getCustomerType() != CustomerType.GUEST || !order.getPhone().equals(phone)) {
            audit("LOOKUP", orderNumber, requestKeyHash, false, now);
            throw new ResourceNotFoundException("주문 정보를 찾을 수 없습니다.");
        }

        audit("LOOKUP", orderNumber, requestKeyHash, true, now);
        return issue(order, now);
    }

    @Transactional
    public AccessGrant issueForCreatedOrder(String orderNumber, String phone) {
        CustomerOrder order = customerOrderRepository.findByOrderNumber(orderNumber.trim())
            .filter(candidate -> candidate.getCustomerType() == CustomerType.GUEST)
            .filter(candidate -> candidate.getPhone().equals(phone.trim()))
            .orElseThrow(() -> new ResourceNotFoundException("주문 정보를 찾을 수 없습니다."));
        return issue(order, OffsetDateTime.now(SEOUL));
    }

    @Transactional(noRollbackFor = ResourceNotFoundException.class)
    public Long authorize(String action, String orderNumber, String rawToken) {
        String normalizedOrderNumber = orderNumber.trim();
        String normalizedToken = rawToken == null ? "" : rawToken.trim();
        String requestKeyHash = hash(action + "|" + normalizedOrderNumber);
        OffsetDateTime now = OffsetDateTime.now(SEOUL);

        enforceRateLimit(action, requestKeyHash, now);

        GuestOrderAccessToken accessToken = normalizedToken.isEmpty()
            ? null
            : tokenRepository.findByTokenHashAndOrder_OrderNumberAndExpiresAtAfter(
                hash(normalizedToken),
                normalizedOrderNumber,
                now
            ).orElse(null);

        if (accessToken == null) {
            audit(action, normalizedOrderNumber, requestKeyHash, false, now);
            throw new ResourceNotFoundException("주문 정보를 찾을 수 없습니다.");
        }

        accessToken.markUsed(now);
        audit(action, normalizedOrderNumber, requestKeyHash, true, now);
        return accessToken.getOrder().getId();
    }

    private AccessGrant issue(CustomerOrder order, OffsetDateTime now) {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        tokenRepository.save(new GuestOrderAccessToken(
            order,
            hash(rawToken),
            now.plus(ACCESS_DURATION),
            now
        ));
        return new AccessGrant(new GuestOrderLookupResponse(order.getOrderNumber()), rawToken);
    }

    private void enforceRateLimit(String action, String requestKeyHash, OffsetDateTime now) {
        long failedAttempts = auditLogRepository
            .countByActionAndRequestKeyHashAndSucceededFalseAndCreatedAtAfter(
                action,
                requestKeyHash,
                now.minus(ATTEMPT_WINDOW)
            );
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            throw new TooManyRequestsException("잠시 후 다시 시도해 주세요.");
        }
    }

    private void audit(
        String action,
        String orderNumber,
        String requestKeyHash,
        boolean succeeded,
        OffsetDateTime createdAt
    ) {
        auditLogRepository.save(new GuestOrderAccessAuditLog(
            action,
            orderNumber,
            requestKeyHash,
            succeeded,
            createdAt
        ));
    }

    private static String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }

    public record AccessGrant(GuestOrderLookupResponse response, String rawToken) {
    }
}
