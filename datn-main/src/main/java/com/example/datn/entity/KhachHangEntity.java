package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "KHACH_HANG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KhachHangEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_khach_hang", length = 20, nullable = false)
    String maKhachHang;

    @Column(name = "ho_ten", length = 100, nullable = false)
    String hoTen;

    @Column(name = "sdt", length = 15)
    String sdt;

    @Column(name = "email", length = 100)
    String email;

    @Column(name = "ngay_sinh")
    LocalDate ngaySinh;

    @Column(name = "gioi_tinh")
    Boolean gioiTinh;

    @Column(name = "trang_thai")
    Boolean trangThai;

    @Column(name = "mat_khau", length = 255)
    String matKhau;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    LocalDateTime ngayTao;
}