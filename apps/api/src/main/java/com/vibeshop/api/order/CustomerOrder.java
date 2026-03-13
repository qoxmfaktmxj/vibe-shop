package com.vibeshop.api.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "customer_orders")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber;

    @Column(name = "customer_name", nullable = false, length = 80)
    private String customerName;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(name = "postal_code", nullable = false, length = 20)
    private String postalCode;

    @Column(nullable = false, length = 255)
    private String address1;

    @Column(nullable = false, length = 255)
    private String address2;

    @Column(nullable = false, length = 255)
    private String note;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal subtotal;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 0)
    private BigDecimal shippingFee;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal total;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerOrderLine> lines = new ArrayList<>();

    public CustomerOrder(
        String orderNumber,
        String customerName,
        String phone,
        String postalCode,
        String address1,
        String address2,
        String note,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        OffsetDateTime createdAt
    ) {
        this.orderNumber = orderNumber;
        this.customerName = customerName;
        this.phone = phone;
        this.postalCode = postalCode;
        this.address1 = address1;
        this.address2 = address2;
        this.note = note;
        this.subtotal = subtotal;
        this.shippingFee = shippingFee;
        this.total = total;
        this.createdAt = createdAt;
    }

    public void addLine(CustomerOrderLine line) {
        lines.add(line);
        line.attach(this);
    }
}

