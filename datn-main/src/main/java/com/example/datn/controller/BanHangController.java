package com.example.datn.controller;

import com.example.datn.entity.NhanVienEntity;
import com.example.datn.repository.NhanVienRepository;
import com.example.datn.service.BanHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Bán Hàng POS — khớp tab "Bán Hàng POS (F2)".
 *
 * GET  /api/ban-hang/san-pham/{id}/bien-the  → biến thể (màu/size/tồn/giá) để chọn khi bán
 * POST /api/ban-hang/kiem-tra-ton            → kiểm tra tồn trước khi thêm vào hóa đơn
 * POST /api/ban-hang/thanh-toan              → lưu hóa đơn + trừ kho, trả bill để in
 * GET  /api/ban-hang/hoa-don/{id}/bill       → in lại bill của hóa đơn cũ
 *
 * ADMIN + NHAN_VIEN đều bán được (POS là màn chính của cả 2 vai trò trên FE).
 */
@RestController
@RequestMapping("/ban-hang")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'NHAN_VIEN')")
public class BanHangController {

    private final BanHangService banHangService;
    private final NhanVienRepository nhanVienRepository;

    @GetMapping("/san-pham/{sanPhamId}/bien-the")
    public ResponseEntity<List<Map<String, Object>>> bienThe(@PathVariable Integer sanPhamId) {
        return ResponseEntity.ok(banHangService.bienTheBanHang(sanPhamId));
    }

    @PostMapping("/kiem-tra-ton")
    public ResponseEntity<List<Map<String, Object>>> kiemTraTon(
            @RequestBody Map<String, List<Map<String, Object>>> body) {
        return ResponseEntity.ok(banHangService.kiemTraTon(body.get("items")));
    }

    /**
     * Thanh toán POS: lưu hóa đơn + trừ tồn kho, trả dữ liệu bill để in.
     * body: { "items":[{"chiTietId":1,"soLuong":2}], "tienGiam":0, "khachHangId":null }
     */
    @PostMapping("/thanh-toan")
    @Transactional
    public ResponseEntity<Map<String, Object>> thanhToan(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        // Lấy id nhân viên đang đăng nhập để ghi vào hóa đơn (có thể null khi test)
        Integer nhanVienId = null;
        if (auth != null && auth.getName() != null) {
            nhanVienId = nhanVienRepository.findByEmail(auth.getName())
                    .map(NhanVienEntity::getId)
                    .orElse(null);
        }
        return ResponseEntity.ok(banHangService.thanhToan(body, nhanVienId));
    }

    /** Lấy lại dữ liệu bill của 1 hóa đơn (in lại khi cần). */
    @GetMapping("/hoa-don/{id}/bill")
    public ResponseEntity<Map<String, Object>> layBill(@PathVariable Integer id) {
        return ResponseEntity.ok(banHangService.layBill(id));
    }

    /** Danh sách hóa đơn (mới nhất trước) — tab Quản Lý Hóa Đơn. */
    @GetMapping("/hoa-don")
    public ResponseEntity<List<Map<String, Object>>> danhSachHoaDon() {
        return ResponseEntity.ok(banHangService.danhSachHoaDon());
    }
}
