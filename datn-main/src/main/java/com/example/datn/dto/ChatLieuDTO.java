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
public class ChatLieuDTO {

    Long id;

    @NotBlank(message = "Mã chất liệu không được để trống")
    @Size(max = 20, message = "Mã chất liệu tối đa 20 ký tự")
    String maChatLieu;

    @NotBlank(message = "Tên chất liệu không được để trống")
    @Size(max = 100, message = "Tên chất liệu tối đa 100 ký tự")
    String tenChatLieu;

    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    String moTa;

    Boolean trangThai;
}