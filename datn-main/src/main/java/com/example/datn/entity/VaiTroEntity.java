package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "VAI_TRO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VaiTroEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_vai_tro", length = 20, nullable = false)
    String maVaiTro;

    @Column(name = "ten_vai_tro", length = 50, nullable = false)
    String tenVaiTro;

    @Column(name = "mo_ta", length = 255)
    String moTa;

    @Column(name = "trang_thai")
    Boolean trangThai;
}