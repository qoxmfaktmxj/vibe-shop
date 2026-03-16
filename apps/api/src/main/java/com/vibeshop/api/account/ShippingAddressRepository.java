package com.vibeshop.api.account;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {

    List<ShippingAddress> findByUser_IdOrderByIsDefaultDescIdAsc(Long userId);

    Optional<ShippingAddress> findByIdAndUser_Id(Long id, Long userId);

    long countByUser_Id(Long userId);
}
