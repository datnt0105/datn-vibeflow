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
public class XuatXuDTO {
    Long id;

    @NotBlank(message = "Mã xuất xứ không được để trống")
    @Size(max = 20, message = "Mã xuất xứ tối đa 20 ký tự")
    String maXuatXu;

    @NotBlank(message = "Tên xuất xứ không được để trống")
    @Size(max = 100, message = "Tên xuất xứ tối đa 100 ký tự")
    String tenXuatXu;

    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    String moTa;

    Boolean trangThai;
}