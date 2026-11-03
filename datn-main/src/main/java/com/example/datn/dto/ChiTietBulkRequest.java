package com.example.datn.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChiTietBulkRequest {
    @NotNull Integer sanPhamId;
    @NotNull Long mauSacId;
    @DecimalMin("0") BigDecimal giaBan;
    @DecimalMin("0") BigDecimal giaGoc;
    @DecimalMin("0") BigDecimal giaNhap;
    @NotEmpty @Valid List<Item> items;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Item {
        @NotNull Long kichThuocId;
        @NotNull @Min(0) Integer soLuong;
    }
}
