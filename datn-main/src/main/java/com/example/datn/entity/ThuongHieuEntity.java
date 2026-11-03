
package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "THUONG_HIEU")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ThuongHieuEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_thuong_hieu", length = 20, nullable = false)
    String maThuongHieu;

    @Column(name = "ten_thuong_hieu", length = 100, nullable = false)
    String tenThuongHieu;

    @Column(name = "mo_ta", length = 255)
    String moTa;

    @Column(name = "trang_thai")
    Boolean trangThai;
}
