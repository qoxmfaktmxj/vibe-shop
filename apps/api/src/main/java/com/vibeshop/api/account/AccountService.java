package com.vibeshop.api.account;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vibeshop.api.account.AccountDtos.AccountProfileResponse;
import com.vibeshop.api.account.AccountDtos.ShippingAddressRequest;
import com.vibeshop.api.account.AccountDtos.ShippingAddressResponse;
import com.vibeshop.api.account.AccountDtos.UpdateProfileRequest;
import com.vibeshop.api.auth.User;
import com.vibeshop.api.auth.UserRepository;
import com.vibeshop.api.common.ResourceNotFoundException;
import com.vibeshop.api.order.CustomerOrderRepository;

@Service
@Transactional
public class AccountService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final UserRepository userRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final CustomerOrderRepository customerOrderRepository;

    public AccountService(
        UserRepository userRepository,
        ShippingAddressRepository shippingAddressRepository,
        CustomerOrderRepository customerOrderRepository
    ) {
        this.userRepository = userRepository;
        this.shippingAddressRepository = shippingAddressRepository;
        this.customerOrderRepository = customerOrderRepository;
    }

    @Transactional(readOnly = true)
    public AccountProfileResponse getProfile(Long userId) {
        User user = getUser(userId);
        return toProfileResponse(user);
    }

    public AccountProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUser(userId);
        user.rename(request.name().trim());
        return toProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public List<ShippingAddressResponse> getAddresses(Long userId) {
        return shippingAddressRepository.findByUser_IdOrderByIsDefaultDescIdAsc(userId).stream()
            .map(this::toAddressResponse)
            .toList();
    }

    public ShippingAddressResponse createAddress(Long userId, ShippingAddressRequest request) {
        User user = getUser(userId);
        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        List<ShippingAddress> addresses = shippingAddressRepository.findByUser_IdOrderByIsDefaultDescIdAsc(userId);

        boolean shouldBeDefault = request.isDefault() || addresses.isEmpty();
        if (shouldBeDefault) {
            clearDefault(addresses, null, now);
        }

        ShippingAddress address = shippingAddressRepository.save(new ShippingAddress(
            user,
            request.label().trim(),
            request.recipientName().trim(),
            request.phone().trim(),
            request.postalCode().trim(),
            request.address1().trim(),
            request.address2() == null ? "" : request.address2().trim(),
            shouldBeDefault,
            now
        ));

        return toAddressResponse(address);
    }

    public ShippingAddressResponse updateAddress(Long userId, Long addressId, ShippingAddressRequest request) {
        OffsetDateTime now = OffsetDateTime.now(SEOUL);
        List<ShippingAddress> addresses = shippingAddressRepository.findByUser_IdOrderByIsDefaultDescIdAsc(userId);
        ShippingAddress address = addresses.stream()
            .filter(item -> item.getId().equals(addressId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("배송지를 찾을 수 없습니다."));

        boolean hasOtherDefault = addresses.stream()
            .anyMatch(item -> !item.getId().equals(addressId) && item.isDefault());
        boolean shouldBeDefault = request.isDefault() || (address.isDefault() && !hasOtherDefault);

        if (shouldBeDefault) {
            clearDefault(addresses, addressId, now);
        }

        address.update(
            request.label().trim(),
            request.recipientName().trim(),
            request.phone().trim(),
            request.postalCode().trim(),
            request.address1().trim(),
            request.address2() == null ? "" : request.address2().trim(),
            shouldBeDefault,
            now
        );

        return toAddressResponse(address);
    }

    public void deleteAddress(Long userId, Long addressId) {
        ShippingAddress address = shippingAddressRepository.findByIdAndUser_Id(addressId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("배송지를 찾을 수 없습니다."));
        boolean wasDefault = address.isDefault();
        shippingAddressRepository.delete(address);

        if (wasDefault) {
            List<ShippingAddress> remaining = shippingAddressRepository.findByUser_IdOrderByIsDefaultDescIdAsc(userId);
            if (!remaining.isEmpty() && remaining.stream().noneMatch(ShippingAddress::isDefault)) {
                remaining.getFirst().changeDefault(true, OffsetDateTime.now(SEOUL));
            }
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("회원 정보를 찾을 수 없습니다."));
    }

    private AccountProfileResponse toProfileResponse(User user) {
        return new AccountProfileResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getProvider().name(),
            user.getCreatedAt(),
            customerOrderRepository.countByUserId(user.getId()),
            shippingAddressRepository.countByUser_Id(user.getId())
        );
    }

    private ShippingAddressResponse toAddressResponse(ShippingAddress address) {
        return new ShippingAddressResponse(
            address.getId(),
            address.getLabel(),
            address.getRecipientName(),
            address.getPhone(),
            address.getPostalCode(),
            address.getAddress1(),
            address.getAddress2(),
            address.isDefault()
        );
    }

    private void clearDefault(List<ShippingAddress> addresses, Long exceptId, OffsetDateTime now) {
        for (ShippingAddress address : addresses) {
            if (exceptId != null && address.getId().equals(exceptId)) {
                continue;
            }
            if (address.isDefault()) {
                address.changeDefault(false, now);
            }
        }
    }
}
