package com.example.datn.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChiTietUpdateRequest {
    @NotNull @Min(0) Integer soLuong;
    @DecimalMin("0") BigDecimal giaBan;
    @DecimalMin("0") BigDecimal giaGoc;
    @DecimalMin("0") BigDecimal giaNhap;
}