package com.example.datn.controller;

import com.example.datn.dto.SanPhamDTO;
import com.example.datn.entity.SanPhamEntity;
import com.example.datn.repository.SanPhamChiTietRepository;
import com.example.datn.repository.SanPhamRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.*;

/**
 * Quản lý Sản Phẩm — Base URL: /api/san-pham (context-path /api đã được strip)
 *
 * GET    /san-pham          → Danh sách sản phẩm đang hoạt động (đã đăng nhập)
 * GET    /san-pham/search   → Tìm kiếm theo q (tên hoặc mã)
 * GET    /san-pham/{id}     → Chi tiết
 * POST   /san-pham          → Thêm mới  (ADMIN)
 * PUT    /san-pham/{id}     → Cập nhật  (ADMIN)
 * DELETE /san-pham/{id}     → Xóa mềm   (ADMIN)
 */
@RestController
@RequestMapping("/san-pham")
@RequiredArgsConstructor
public class SanPhamController {
    @Autowired
    private  SanPhamRepository sanPhamRepository;
    @Autowired
    private  SanPhamChiTietRepository chiTietRepository;
    // ------------------------------------------------------------------ helper

    private SanPhamDTO toDTO(SanPhamEntity e) {
        return SanPhamDTO.builder()
                .id(e.getId())
                .maSanPham(e.getMaSanPham())
                .tenSanPham(e.getTenSanPham())
                .danhMucId(e.getDanhMucId())
                .thuongHieuId(e.getThuongHieuId())
                .xuatXuId(e.getXuatXuId())
                .chatLieuId(e.getChatLieuId())
                .moTa(e.getMoTa())
                .giaBan(e.getGiaBan())
                .giaGoc(e.getGiaGoc())
                .trangThai(Boolean.TRUE.equals(e.getTrangThai()))
                .ngayTao(e.getNgayTao() != null ? e.getNgayTao().toString() : null)
                .build();
    }

    /** Sinh mã dạng SP + 8 ký tự ngẫu nhiên (tối đa 10 ký tự, cột DB cho phép 20), kiểm tra trùng. */
    private String generateMaSanPham() {
        String ma;
        do {
            ma = "SP" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (sanPhamRepository.existsByMaSanPham(ma));
        return ma;
    }

    private ResponseEntity<Map<String, Object>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "Không tìm thấy sản phẩm!"));
    }

    // --------------------------------------------------------------------- GET

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Integer thuongHieuId) {

        size = Math.min(Math.max(size, 1), 100);
        page = Math.max(page, 0);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "ngayTao"));
        Page<SanPhamEntity> result = sanPhamRepository.findWithPaging(q.trim(), thuongHieuId, pageable);

        List<SanPhamEntity> items = result.getContent();
        List<Long> ids = items.stream().map(SanPhamEntity::getId).toList();

        // Tồn kho và ảnh chính của cả trang: 2 query duy nhất
        Map<Long, Long> tonKho = new HashMap<>();
        Map<Long, String> anhChinh = new HashMap<>();

        if (!ids.isEmpty()) {   // IN () với list rỗng sẽ lỗi trên SQL Server
            for (Object[] r : chiTietRepository.sumSoLuongBySanPhamIds(ids)) {
                tonKho.put(((Number) r[0]).longValue(), ((Number) r[1]).longValue());
            }

        }

        List<SanPhamDTO> content = items.stream().map(e -> {
            SanPhamDTO dto = toDTO(e);
            dto.setTongTonKho(tonKho.getOrDefault(e.getId(), 0L));
            return dto;
        }).toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", content);
        response.put("page", result.getNumber());
        response.put("size", result.getSize());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("first", result.isFirst());
        response.put("last", result.isLast());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SanPhamDTO>> search(@RequestParam(defaultValue = "") String q) {
        List<SanPhamDTO> list = sanPhamRepository
                .search(q.trim())
                .stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return sanPhamRepository.findByIdAndTrangThaiTrue(id)
                .<ResponseEntity<?>>map(e -> ResponseEntity.ok(toDTO(e)))
                .orElseGet(this::notFound);
    }

    // -------------------------------------------------------------------- POST

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody SanPhamDTO dto) {
        SanPhamEntity entity = SanPhamEntity.builder()
                .maSanPham(generateMaSanPham())
                .tenSanPham(dto.getTenSanPham().trim())
                .danhMucId(dto.getDanhMucId())
                .thuongHieuId(dto.getThuongHieuId())
                .xuatXuId(dto.getXuatXuId())
                .moTa(dto.getMoTa())
                .giaBan(dto.getGiaBan())
                .giaGoc(dto.getGiaGoc())
                .trangThai(true)
                .chatLieuId(dto.getChatLieuId())
                .build();

        SanPhamEntity saved = sanPhamRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("success", true, "message", "Thêm sản phẩm thành công!", "data", toDTO(saved)));
    }

    // --------------------------------------------------------------------- PUT

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody SanPhamDTO dto) {
        return sanPhamRepository.findById(id)
                .<ResponseEntity<?>>map(entity -> {
                    entity.setTenSanPham(dto.getTenSanPham().trim());
                    entity.setGiaBan(dto.getGiaBan());
                    if (dto.getDanhMucId()    != null) entity.setDanhMucId(dto.getDanhMucId());
                    if (dto.getThuongHieuId() != null) entity.setThuongHieuId(dto.getThuongHieuId());
                    if (dto.getXuatXuId()     != null) entity.setXuatXuId(dto.getXuatXuId());
                    if (dto.getMoTa()         != null) entity.setMoTa(dto.getMoTa());
                    if (dto.getTrangThai()    != null) entity.setTrangThai(dto.getTrangThai());
                    if (dto.getChatLieuId()    != null) entity.setChatLieuId(dto.getChatLieuId());

                    SanPhamEntity saved = sanPhamRepository.save(entity);
                    return ResponseEntity.ok(Map.of(
                            "success", true, "message", "Cập nhật sản phẩm thành công!", "data", toDTO(saved)));
                })
                .orElseGet(this::notFound);
    }

    // ------------------------------------------------------------------ DELETE

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return sanPhamRepository.findById(id)
                .<ResponseEntity<?>>map(entity -> {
                    entity.setTrangThai(false); // xóa mềm
                    sanPhamRepository.save(entity);
                    return ResponseEntity.ok(
                            Map.of("success", true, "message", "Đã xóa sản phẩm thành công!"));
                })
                .orElseGet(this::notFound);
    }

    @PatchMapping("/{id}/trang-thai")
    public ResponseEntity<SanPhamDTO> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> body) {

        SanPhamEntity e = sanPhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        e.setTrangThai(Boolean.TRUE.equals(body.get("trangThai")));
        return ResponseEntity.ok(toDTO(sanPhamRepository.save(e)));
    }
}