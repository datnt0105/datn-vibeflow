package com.example.datn.controller;

import com.example.datn.dto.common.PageResponse;
import com.example.datn.dto.common.TrangThaiRequest;
import com.example.datn.dto.khachhang.KhachHangRequest;
import com.example.datn.dto.khachhang.KhachHangResponse;
import com.example.datn.dto.khachhang.KhachHangThongKe;
import com.example.datn.service.KhachHangService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Quản lý khách hàng — FE route /admin/khach-hang (SCR-ADM-KH-01).
 * URL thực tế: /api/admin/khach-hang (context-path /api).
 * ADR-002: ADMIN + NHAN_VIEN xem/thêm/sửa; chỉ ADMIN khóa / mở khóa.
 */
@RestController
@RequestMapping("/khach-hang")
@PreAuthorize("hasAnyRole('ADMIN', 'NHAN_VIEN')")
public class KhachHangController {

    @Autowired
    private KhachHangService khachHangService;

    @GetMapping
    public PageResponse<KhachHangResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean gioiTinh,
            @RequestParam(required = false) Boolean trangThai,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return khachHangService.search(q, gioiTinh, trangThai, page, size);
    }

    @GetMapping("/thong-ke")
    public KhachHangThongKe thongKe() {
        return khachHangService.thongKe();
    }

    @GetMapping("/{id}")
    public KhachHangResponse getById(@PathVariable Long id) {
        return khachHangService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KhachHangResponse create(@Valid @RequestBody KhachHangRequest req) {
        return khachHangService.create(req);
    }

    @PutMapping("/{id}")
    public KhachHangResponse update(@PathVariable Long id, @Valid @RequestBody KhachHangRequest req) {
        return khachHangService.update(id, req);
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    public KhachHangResponse updateTrangThai(@PathVariable Long id, @Valid @RequestBody TrangThaiRequest req) {
        return khachHangService.updateTrangThai(id, req.trangThai());
    }
}
