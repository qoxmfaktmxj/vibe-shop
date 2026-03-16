package com.vibeshop.api.order;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderPaymentRepository extends JpaRepository<OrderPayment, Long> {

    Optional<OrderPayment> findByOrder_Id(Long orderId);

    List<OrderPayment> findByOrder_IdIn(Collection<Long> orderIds);
}
