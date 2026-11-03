package com.example.datn.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DanhMucDTO {
    Long id;

    @NotBlank(message = "Mã danh mục không được để trống")
    @Size(max = 20, message = "Mã danh mục tối đa 20 ký tự")
    String maDanhMuc;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục tối đa 100 ký tự")
    String tenDanhMuc;

    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    String moTa;

    Boolean trangThai;
}