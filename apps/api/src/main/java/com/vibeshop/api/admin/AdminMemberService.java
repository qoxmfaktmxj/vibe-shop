package com.vibeshop.api.admin;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.account.ShippingAddressRepository;
import com.vibeshop.api.admin.AdminDtos.AdminMemberResponse;
import com.vibeshop.api.admin.AdminDtos.UpdateAdminMemberStatusRequest;
import com.vibeshop.api.auth.User;
import com.vibeshop.api.auth.UserRepository;
import com.vibeshop.api.auth.UserRole;
import com.vibeshop.api.auth.UserSessionRepository;
import com.vibeshop.api.auth.UserStatus;
import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.order.CustomerOrder;
import com.vibeshop.api.order.CustomerOrderRepository;
import com.vibeshop.api.order.OrderPayment;
import com.vibeshop.api.order.OrderPaymentRepository;
import com.vibeshop.api.order.PaymentStatus;

@Service
@Transactional
public class AdminMemberService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final OrderPaymentRepository orderPaymentRepository;

    public AdminMemberService(
        UserRepository userRepository,
        UserSessionRepository userSessionRepository,
        ShippingAddressRepository shippingAddressRepository,
        CustomerOrderRepository customerOrderRepository,
        OrderPaymentRepository orderPaymentRepository
    ) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.shippingAddressRepository = shippingAddressRepository;
        this.customerOrderRepository = customerOrderRepository;
        this.orderPaymentRepository = orderPaymentRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminMemberResponse> getMembers(String status, String provider, String keyword) {
        MemberMetrics metrics = buildMetrics();
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .filter(user -> user.getRole() == UserRole.CUSTOMER)
            .filter(user -> matchesStatus(user, status))
            .filter(user -> matchesProvider(user, provider))
            .filter(user -> matchesKeyword(user, keyword))
            .map(user -> toResponse(user, metrics))
            .toList();
    }

    public AdminMemberResponse updateMemberStatus(Long memberId, UpdateAdminMemberStatusRequest request) {
        User user = userRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("회원을 찾을 수 없습니다."));
        if (user.getRole() != UserRole.CUSTOMER) {
            throw new IllegalArgumentException("관리자 계정은 이 화면에서 상태를 변경할 수 없습니다.");
        }

        UserStatus nextStatus = parseStatus(request.status());
        user.changeStatus(nextStatus);
        if (nextStatus == UserStatus.BLOCKED) {
            userSessionRepository.deleteAllByUser_Id(user.getId());
        }

        return toResponse(user, buildMetrics());
    }

    private AdminMemberResponse toResponse(User user, MemberMetrics metrics) {
        return new AdminMemberResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getProvider().name(),
            user.getRole().name(),
            user.getStatus().name(),
            user.isMarketingOptIn(),
            user.getCreatedAt(),
            user.getLastLoginAt(),
            metrics.orderCountByUserId().getOrDefault(user.getId(), 0L),
            metrics.addressCountByUserId().getOrDefault(user.getId(), 0L),
            metrics.totalSpentByUserId().getOrDefault(user.getId(), ZERO)
        );
    }

    private MemberMetrics buildMetrics() {
        List<CustomerOrder> orders = customerOrderRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, OrderPayment> paymentByOrderId = orders.isEmpty()
            ? Map.of()
            : orderPaymentRepository.findByOrder_IdIn(
                orders.stream().map(CustomerOrder::getId).toList()
            ).stream().collect(Collectors.toMap(payment -> payment.getOrder().getId(), payment -> payment));

        Map<Long, Long> orderCountByUserId = orders.stream()
            .filter(order -> order.getUserId() != null)
            .collect(Collectors.groupingBy(CustomerOrder::getUserId, Collectors.counting()));

        Map<Long, BigDecimal> totalSpentByUserId = orders.stream()
            .filter(order -> order.getUserId() != null)
            .filter(order -> {
                OrderPayment payment = paymentByOrderId.get(order.getId());
                return payment != null && payment.getPaymentStatus() == PaymentStatus.SUCCEEDED;
            })
            .collect(Collectors.toMap(
                CustomerOrder::getUserId,
                CustomerOrder::getTotal,
                BigDecimal::add
            ));

        Map<Long, Long> addressCountByUserId = shippingAddressRepository.findAll().stream()
            .collect(Collectors.groupingBy(address -> address.getUser().getId(), Collectors.counting()));

        return new MemberMetrics(orderCountByUserId, addressCountByUserId, totalSpentByUserId);
    }

    private boolean matchesStatus(User user, String status) {
        if (status == null || status.isBlank()) {
            return true;
        }
        return user.getStatus().name().equalsIgnoreCase(status.trim());
    }

    private boolean matchesProvider(User user, String provider) {
        if (provider == null || provider.isBlank()) {
            return true;
        }
        return user.getProvider().name().equalsIgnoreCase(provider.trim());
    }

    private boolean matchesKeyword(User user, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String haystack = String.join(
            " ",
            user.getName(),
            user.getEmail(),
            user.getPhone() == null ? "" : user.getPhone()
        ).toLowerCase();
        return haystack.contains(keyword.trim().toLowerCase());
    }

    private UserStatus parseStatus(String status) {
        try {
            return UserStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("유효한 회원 상태가 아닙니다.");
        }
    }

    private record MemberMetrics(
        Map<Long, Long> orderCountByUserId,
        Map<Long, Long> addressCountByUserId,
        Map<Long, BigDecimal> totalSpentByUserId
    ) {
    }
}
