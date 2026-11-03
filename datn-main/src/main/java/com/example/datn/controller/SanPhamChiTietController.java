package com.example.datn.controller;

import com.example.datn.dto.ChiTietBulkRequest;
import com.example.datn.dto.ChiTietUpdateRequest;
import com.example.datn.dto.SanPhamChiTietDTO;
import com.example.datn.entity.KichThuocEntity;
import com.example.datn.entity.MauSacEntity;
import com.example.datn.entity.SanPhamChiTietEntity;
import com.example.datn.entity.SanPhamEntity;
import com.example.datn.repository.KichThuocRepository;
import com.example.datn.repository.MauSacRepository;
import com.example.datn.repository.SanPhamChiTietRepository;
import com.example.datn.repository.SanPhamRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chi-tiet-san-pham")
public class SanPhamChiTietController {

    @Autowired
    private SanPhamChiTietRepository repo;
    @Autowired
    private SanPhamRepository sanPhamRepo;
    @Autowired
    private MauSacRepository mauSacRepo;
    @Autowired
    private KichThuocRepository kichThuocRepo;

    private boolean isAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping("/san-pham/{sanPhamId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<SanPhamChiTietDTO>> getBySanPham(@PathVariable Long sanPhamId,
                                                                Authentication auth) {
        boolean admin = isAdmin(auth);
        return ResponseEntity.ok(repo.findActiveBySanPham(sanPhamId).stream()
                .map(e -> toDTO(e, admin)).toList());
    }

    private SanPhamChiTietDTO toDTO(SanPhamChiTietEntity e, boolean admin) {
        SanPhamEntity sp = e.getSanPham();
        return SanPhamChiTietDTO.builder()
                .id(e.getId())
                .maChiTiet(e.getMaChiTiet())
                .sanPhamId(sp.getId())
                .mauSacId(e.getMauSac().getId())
                .tenMau(e.getMauSac().getTenMau())
                .maHex(e.getMauSac().getMaHex())
                .kichThuocId(e.getKichThuoc().getId())
                .tenKichThuoc(e.getKichThuoc().getTenKichThuoc())
                .soLuong(e.getSoLuong() == null ? 0 : e.getSoLuong())
                .giaBan(e.getGiaBan())
                .giaGoc(e.getGiaGoc())
                .giaNhap(admin ? e.getGiaNhap() : null)      // không lộ giá nhập cho nhân viên
                .giaBanHieuLuc(e.getGiaBan() != null ? e.getGiaBan() : sp.getGiaBan())
                .giaGocHieuLuc(e.getGiaGoc() != null ? e.getGiaGoc() : sp.getGiaGoc())
                .trangThai(e.getTrangThai())
                .build();
    }
    private void checkGia(BigDecimal giaBan, BigDecimal giaGoc, BigDecimal giaNhap, SanPhamEntity sp) {
        BigDecimal ban = giaBan != null ? giaBan : sp.getGiaBan();
        BigDecimal goc = giaGoc != null ? giaGoc : sp.getGiaGoc();
        if (ban != null && goc != null && goc.compareTo(ban) < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá gốc phải ≥ giá bán");
        if (ban != null && giaNhap != null && giaNhap.compareTo(ban) > 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá nhập không được lớn hơn giá bán");
    }

    // ── Thêm nhiều size cho 1 màu ──
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> createBulk(@Valid @RequestBody ChiTietBulkRequest req) {

        // 1. Tra cứu sản phẩm và màu
        SanPhamEntity sp = sanPhamRepo.findByIdAndTrangThaiTrue(req.getSanPhamId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        MauSacEntity mau = mauSacRepo.findByIdAndTrangThaiTrue(req.getMauSacId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy màu"));

        // 2. Kiểm tra giá NGAY SAU KHI có sp (cần sp để lấy giá mặc định)
        //    Nếu giá sai thì dừng luôn, chưa lưu gì
        checkGia(req.getGiaBan(), req.getGiaGoc(), req.getGiaNhap(), sp);

        List<SanPhamChiTietDTO> created = new ArrayList<>();
        List<String> skipped = new ArrayList<>();

        // 3. Tạo từng biến thể theo size
        for (ChiTietBulkRequest.Item it : req.getItems()) {
            KichThuocEntity size = kichThuocRepo.findByIdAndTrangThaiTrue(it.getKichThuocId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy size"));

            // Đã có biến thể (sản phẩm + màu + size) thì bỏ qua
            if (repo.existsBySanPham_IdAndMauSac_IdAndKichThuoc_IdAndTrangThaiTrue(
                    sp.getId(), mau.getId(), size.getId())) {
                skipped.add(size.getTenKichThuoc());
                continue;
            }

            String ma = sp.getMaSanPham() + "-" + mau.getMaMau() + "-" + size.getTenKichThuoc();
            if (ma.length() > 30) ma = ma.substring(0, 30);   // cột ma_chi_tiet tối đa 30 ký tự

            SanPhamChiTietEntity e = SanPhamChiTietEntity.builder()
                    .maChiTiet(ma)
                    .sanPham(sp)
                    .mauSac(mau)
                    .kichThuoc(size)
                    .soLuong(it.getSoLuong())
                    .giaBan(req.getGiaBan())     // null = theo giá sản phẩm
                    .giaGoc(req.getGiaGoc())     // null = theo giá gốc sản phẩm
                    .giaNhap(req.getGiaNhap())
                    .trangThai(true)
                    .build();

            // true: người gọi là ADMIN (đã được @PreAuthorize chặn), nên trả luôn giá nhập
            created.add(toDTO(repo.save(e), true));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("created", created);
        body.put("skipped", skipped);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
    // ── Sửa số lượng, giá ──
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<SanPhamChiTietDTO> update(@PathVariable Long id,
                                                    @Valid @RequestBody ChiTietUpdateRequest req) {

        SanPhamChiTietEntity e = repo.findByIdAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy biến thể"));

        // Kiểm tra giá trước khi gán, dùng sản phẩm của chính biến thể này
        checkGia(req.getGiaBan(), req.getGiaGoc(), req.getGiaNhap(), e.getSanPham());

        e.setSoLuong(req.getSoLuong());
        e.setGiaBan(req.getGiaBan());
        e.setGiaGoc(req.getGiaGoc());
        e.setGiaNhap(req.getGiaNhap());

        return ResponseEntity.ok(toDTO(repo.save(e), true));
    }

    // ── Xóa mềm ──
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        SanPhamChiTietEntity e = repo.findByIdAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy biến thể"));
        e.setTrangThai(false);
        repo.save(e);
        return ResponseEntity.noContent().build();
    }
}