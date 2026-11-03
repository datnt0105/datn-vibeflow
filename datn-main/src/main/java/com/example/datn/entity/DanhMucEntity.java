
package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "DANH_MUC")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DanhMucEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_danh_muc", length = 20, nullable = false)
    String maDanhMuc;

    @Column(name = "ten_danh_muc", length = 100, nullable = false)
    String tenDanhMuc;

    @Column(name = "mo_ta", length = 255)
    String moTa;

    @Column(name = "trang_thai")
    Boolean trangThai;
}
