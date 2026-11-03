package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Hóa đơn bán hàng — bảng HOA_DON (đã có trong db.sql).
 * khachHangId nullable: POS được bán cho khách vãng lai.
 */
@Entity
@Table(name = "HOA_DON")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoaDonEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "ma_hoa_don", length = 20, nullable = false)
    String maHoaDon;

    @Column(name = "khach_hang_id")
    Integer khachHangId;

    @Column(name = "nhan_vien_id")
    Integer nhanVienId;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    LocalDateTime ngayTao;

    @Column(name = "tong_tien", precision = 12, scale = 2)
    BigDecimal tongTien;

    @Column(name = "tien_giam", precision = 12, scale = 2)
    BigDecimal tienGiam;

    @Column(name = "thanh_tien", precision = 12, scale = 2)
    BigDecimal thanhTien;

    /** 1 = POS tại quầy, 2 = Online. (tránh phụ thuộc enum khi mới mở rộng) */
    @Column(name = "trang_thai")
    Integer trangThai;
}
