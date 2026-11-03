package com.example.datn.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPhamDTO {

    private Long id;
    private String maSanPham;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 150, message = "Tên sản phẩm tối đa 150 ký tự")
    private String tenSanPham;

    private Integer danhMucId;
    private Integer thuongHieuId;
    private Integer xuatXuId;
    private Integer chatLieuId;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String moTa;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", message = "Giá bán không được âm")
    private BigDecimal giaBan;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", message = "Giá bán không được âm")
    private BigDecimal giaGoc;

    private Boolean trangThai;
    private String ngayTao;
    private Long tongTonKho;
}