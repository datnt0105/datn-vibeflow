package com.example.datn.service;

import com.example.datn.entity.HoaDonChiTietEntity;
import com.example.datn.entity.HoaDonEntity;
import com.example.datn.entity.SanPhamChiTietEntity;
import com.example.datn.repository.BanHangRepository;
import com.example.datn.repository.HoaDonChiTietRepository;
import com.example.datn.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Nghiệp vụ màn Bán Hàng POS:
 *  - Danh sách sản phẩm + biến thể (màu/size/tồn/giá) để bán.
 *  - Kiểm tra tồn trước khi thêm vào hóa đơn.
 *  - Thanh toán: lưu HOA_DON + HOA_DON_CHI_TIET, trừ tồn kho, trả dữ liệu bill K80 để in.
 */
@Service
@RequiredArgsConstructor
public class BanHangService {

    private final BanHangRepository banHangRepo;
    private final HoaDonRepository hoaDonRepo;
    private final HoaDonChiTietRepository hoaDonChiTietRepo;

    /** Biến thể bán được của 1 sản phẩm (đang hoạt động, còn trong lưới màu×size). */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> bienTheBanHang(Integer sanPhamId) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : banHangRepo.findBienTheBanHang(sanPhamId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",           ((Number) r[0]).longValue());
            m.put("maChiTiet",    (String) r[1]);
            m.put("tenMau",       (String) r[2]);
            m.put("maHex",        (String) r[3]);
            m.put("tenKichThuoc", (String) r[4]);
            m.put("soLuong",      ((Number) r[5]).longValue());
            m.put("giaBan",       r[6] == null ? null : new BigDecimal(r[6].toString()));
            list.add(m);
        }
        return list;
    }

    /**
     * Kiểm tra tồn kho trước khi bán — FE gọi mỗi lần thêm sản phẩm vào hóa đơn POS.
     * body: { "items": [ { "chiTietId": 1, "soLuong": 2 }, ... ] }
     * Trả về items kèm flag "duHang" và tồn hiện tại.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> kiemTraTon(List<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách sản phẩm trống!");
        }
        List<Map<String, Object>> res = new ArrayList<>();
        for (Map<String, Object> it : items) {
            Long chiTietId = it.get("chiTietId") == null ? null : Long.valueOf(it.get("chiTietId").toString());
            long soLuong   = it.get("soLuong")  == null ? 1    : Long.parseLong(it.get("soLuong").toString());
            if (chiTietId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu chiTietId!");
            }

            var bt = banHangRepo.findById(chiTietId)
                    .filter(e -> Boolean.TRUE.equals(e.getTrangThai()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy biến thể id=" + chiTietId));

            long ton = bt.getSoLuong() == null ? 0 : bt.getSoLuong();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("chiTietId", chiTietId);
            m.put("tenSanPham", bt.getSanPham().getTenSanPham());
            m.put("tenKichThuoc", bt.getKichThuoc().getTenKichThuoc());
            m.put("tenMau", bt.getMauSac().getTenMau());
            m.put("soLuongYeuCau", soLuong);
            m.put("tonKho", ton);
            m.put("duHang", soLuong <= ton);
            res.add(m);
        }
        return res;
    }

    /**
     * Thanh toán POS: lưu hóa đơn + chi tiết, trừ tồn kho, trả dữ liệu bill để in.
     * body: {
     *   "items":      [ { "chiTietId": 1, "soLuong": 2 }, ... ],
     *   "tienGiam":   0,              // tùy chọn
     *   "khachHangId": 5,             // tùy chọn (khách vãng lai để null)
     *   "ghiChu":     "..."           // tùy chọn, chỉ để FE in thêm dòng này
     * }
     */
    @Transactional
    public Map<String, Object> thanhToan(Map<String, Object> body, Integer nhanVienId) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        if (items == null || items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hóa đơn đang trống!");
        }
        BigDecimal tienGiam = body.get("tienGiam") == null ? BigDecimal.ZERO
                : new BigDecimal(body.get("tienGiam").toString());
        if (tienGiam.signum() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giảm giá không được âm!");
        }
        Integer khachHangId = body.get("khachHangId") == null ? null
                : Integer.valueOf(body.get("khachHangId").toString());

        // ── 1. Chốt dữ liệu dòng hàng: kiểm tra tồn và lấy giá hiệu lực ──
        BigDecimal tongTien = BigDecimal.ZERO;
        List<HoaDonChiTietEntity> dongHang = new ArrayList<>();
        for (Map<String, Object> it : items) {
            Long chiTietId = it.get("chiTietId") == null ? null : Long.valueOf(it.get("chiTietId").toString());
            int soLuong    = it.get("soLuong")  == null ? 0    : Integer.parseInt(it.get("soLuong").toString());
            if (chiTietId == null || soLuong <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dòng hàng không hợp lệ!");
            }

            SanPhamChiTietEntity bt = banHangRepo.findById(chiTietId)
                    .filter(e -> Boolean.TRUE.equals(e.getTrangThai()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Không tìm thấy biến thể id=" + chiTietId));

            long ton = bt.getSoLuong() == null ? 0 : bt.getSoLuong();
            if (soLuong > ton) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, String.format(
                        "«%s» chỉ còn %d đôi (yêu cầu %d)!",
                        bt.getSanPham().getTenSanPham(), ton, soLuong));
            }

            // Giá bán: biến thể override, không thì theo giá sản phẩm
            BigDecimal donGia = bt.getGiaBan() != null ? bt.getGiaBan() : bt.getSanPham().getGiaBan();
            BigDecimal thanhTien = donGia.multiply(BigDecimal.valueOf(soLuong));
            tongTien = tongTien.add(thanhTien);

            dongHang.add(HoaDonChiTietEntity.builder()
                    .chiTietSanPham(bt)
                    .soLuong(soLuong)
                    .donGia(donGia)
                    .thanhTien(thanhTien)
                    .build());
        }

        if (tienGiam.compareTo(tongTien) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiền giảm không được lớn hơn tạm tính!");
        }

        // ── 2. Lưu hóa đơn (trạng thái 1 = POS) ──
        HoaDonEntity hd = hoaDonRepo.save(HoaDonEntity.builder()
                .maHoaDon(sinhMaHoaDon())
                .khachHangId(khachHangId)
                .nhanVienId(nhanVienId)
                .tongTien(tongTien)
                .tienGiam(tienGiam)
                .thanhTien(tongTien.subtract(tienGiam))
                .trangThai(1) // 1 = POS tại quầy (quy ước thống kê)
                .build());

        // ── 3. Lưu chi tiết + trừ tồn kho ──
        for (HoaDonChiTietEntity ct : dongHang) {
            ct.setHoaDon(hd);
            hoaDonChiTietRepo.save(ct);

            SanPhamChiTietEntity bt = ct.getChiTietSanPham();
            bt.setSoLuong(bt.getSoLuong() - ct.getSoLuong());
            banHangRepo.save(bt);
        }

        // ── 4. Trả dữ liệu bill K80 cho FE dựng trang in ──
        return buildBill(hd, dongHang);
    }

    /** Dữ liệu bill in khổ 80mm: thông tin cửa hàng, dòng hàng, tiền, thời gian, thu ngân. */
    @Transactional(readOnly = true)
    public Map<String, Object> layBill(Integer hoaDonId) {
        HoaDonEntity hd = hoaDonRepo.findById(hoaDonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn!"));
        List<HoaDonChiTietEntity> ds = hoaDonChiTietRepo.findAll().stream()
                .filter(c -> c.getHoaDon() != null && Objects.equals(c.getHoaDon().getId(), hd.getId()))
                .toList();
        return buildBill(hd, ds);
    }

    /** Danh sách hóa đơn (mới nhất trước) cho tab Quản Lý Hóa Đơn — kèm tóm tắt dòng hàng. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> danhSachHoaDon() {
        List<HoaDonEntity> all = hoaDonRepo.findAll(Sort.by(Sort.Direction.DESC, "id"));
        List<Map<String, Object>> res = new ArrayList<>();
        for (HoaDonEntity hd : all) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", hd.getId());
            m.put("maHoaDon", hd.getMaHoaDon());
            m.put("ngayTao", hd.getNgayTao() == null ? null : hd.getNgayTao().toString());
            m.put("trangThai", hd.getTrangThai());          // 1 = POS, 2 = Online
            m.put("khachHangId", hd.getKhachHangId());
            m.put("nhanVienId", hd.getNhanVienId());
            m.put("tongTien", hd.getTongTien());
            m.put("tienGiam", hd.getTienGiam());
            m.put("thanhTien", hd.getThanhTien());
            String items = hoaDonChiTietRepo.findAll().stream()
                    .filter(c -> c.getHoaDon() != null && Objects.equals(c.getHoaDon().getId(), hd.getId()))
                    .map(c -> c.getChiTietSanPham().getSanPham().getTenSanPham() + " x" + c.getSoLuong())
                    .collect(java.util.stream.Collectors.joining(", "));
            m.put("itemsSummary", items);
            res.add(m);
        }
        return res;
    }

    // ─────────────────────────────────────────────────────────── helpers

    /** Sinh mã hóa đơn dạng POS + yyMMdd + 4 số ngẫu nhiên, kiểm tra trùng DB. */
    private String sinhMaHoaDon() {
        String prefix = "POS" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        for (int i = 0; i < 50; i++) {
            String ma = prefix + String.format("%04d", (int) (Math.random() * 10000));
            if (!hoaDonRepo.existsByMaHoaDon(ma)) return ma;
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Không sinh được mã hóa đơn, thử lại!");
    }

    private Map<String, Object> buildBill(HoaDonEntity hd, List<HoaDonChiTietEntity> ds) {
        List<Map<String, Object>> lines = new ArrayList<>();
        for (HoaDonChiTietEntity ct : ds) {
            SanPhamChiTietEntity bt = ct.getChiTietSanPham();
            Map<String, Object> l = new LinkedHashMap<>();
            l.put("tenSanPham",   bt.getSanPham().getTenSanPham());
            l.put("mauSac",       bt.getMauSac().getTenMau());
            l.put("kichThuoc",    bt.getKichThuoc().getTenKichThuoc());
            l.put("soLuong",      ct.getSoLuong());
            l.put("donGia",       ct.getDonGia());
            l.put("thanhTien",    ct.getThanhTien());
            lines.add(l);
        }

        Map<String, Object> bill = new LinkedHashMap<>();
        bill.put("maHoaDon",  hd.getMaHoaDon());
        bill.put("ngayTao",   hd.getNgayTao() == null ? LocalDateTime.now().toString() : hd.getNgayTao().toString());
        bill.put("kenh",      "Bán tại quầy (POS)");
        bill.put("nhanVienId", hd.getNhanVienId());
        bill.put("khachHangId", hd.getKhachHangId());
        bill.put("danhSach",  lines);
        bill.put("tongTien",  hd.getTongTien());
        bill.put("tienGiam",  hd.getTienGiam());
        bill.put("thanhTien", hd.getThanhTien());
        return bill;
    }
}

