package com.example.datn.service;

import com.example.datn.repository.ThongKeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;

/**
 * Thống kê Dashboard — khớp 4 KPI card + biểu đồ 7 ngày + tỷ trọng kênh + top bán chạy + tồn thấp
 * trong giao diện Admin (tab Dashboard / Thống Kê).
 *
 * period: today | 7days | month | year (mặc định 7days).
 */
@Service
@RequiredArgsConstructor
public class ThongKeService {

    private final ThongKeRepository repo;

    /** Số đôi tồn kho thấp để hiện cảnh báo (khớp nhãn "< 10 đôi" trên FE). */
    private static final int NGUONG_TON_THAP = 10;

    @Transactional(readOnly = true)
    public Map<String, Object> dashboard(String period) {
        LocalDateTime[] kieuKy = khoangThoiGian(period);      // kỳ hiện tại
        LocalDateTime tu = kieuKy[0], den = kieuKy[1];
        LocalDateTime[] kyTruoc = khoangTruoc(period, tu, den); // kỳ trước để so % tăng trưởng

        // ── KPI: doanh thu, số đơn, AOV, số đôi xuất kho ──
        Object[] hienTai = repo.tongHopTheoKy(tu, den);
        BigDecimal doanhThu = asBigDecimal(hienTai[0]);
        long soDon          = asLong(hienTai[1]);
        long soDoiXuatKho   = asLong(hienTai[2]);
        BigDecimal aov = soDon == 0 ? BigDecimal.ZERO
                : doanhThu.divide(BigDecimal.valueOf(soDon), 0, RoundingMode.HALF_UP);

        Object[] truoc = repo.tongHopKyTruoc(kyTruoc[0], kyTruoc[1]);
        BigDecimal doanhThuTruoc = asBigDecimal(truoc[0]);
        long soDonTruoc          = asLong(truoc[1]);

        // ── Tỷ trọng kênh (Online = trạng thái 2, POS = 1) ──
        BigDecimal dtOnline = repo.doanhThuOnline(tu, den);
        BigDecimal dtPos    = repo.doanhThuPos(tu, den);
        BigDecimal tongKen  = dtOnline.add(dtPos);
        int phanTramOnline = tongKen.signum() == 0 ? 0
                : dtOnline.multiply(BigDecimal.valueOf(100)).divide(tongKen, 0, RoundingMode.HALF_UP).intValue();
        int phanTramPos    = tongKen.signum() == 0 ? 0 : 100 - phanTramOnline;

        // ── Biểu đồ 7 ngày gần nhất (luôn 7 ngày, không phụ thuộc kỳ đang chọn) ──
        LocalDateTime c7 = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime c7Den = LocalDate.now().plusDays(1).atStartOfDay();
        Map<LocalDate, BigDecimal> theoNgay = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) theoNgay.put(LocalDate.now().minusDays(i), BigDecimal.ZERO);
        for (Object[] r : repo.doanhThuTheoNgay(c7, c7Den)) {
            LocalDate d = toLocalDate(r[0]);
            if (d != null) theoNgay.put(d, asBigDecimal(r[1]));
        }
        List<Map<String, Object>> bieuDo7Ngay = theoNgay.entrySet().stream()
                .map(e -> {
                    String thu = switch (e.getKey().getDayOfWeek()) {
                        case MONDAY -> "Thứ 2"; case TUESDAY -> "Thứ 3"; case WEDNESDAY -> "Thứ 4";
                        case THURSDAY -> "Thứ 5"; case FRIDAY -> "Thứ 6"; case SATURDAY -> "Thứ 7";
                        default -> "Chủ Nhật";
                    };
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("ngay", e.getKey().toString());
                    m.put("thu", thu);
                    m.put("doanhThu", e.getValue());
                    return m;
                }).toList();
        BigDecimal peak = theoNgay.values().stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        // ── Top sản phẩm bán chạy + tồn kho thấp ──
        List<Map<String, Object>> topBanChay = new ArrayList<>();
        for (Object[] r : repo.topBanChay(tu, den, PageRequest.of(0, 5))) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("sanPhamId",    ((Number) r[0]).longValue());
            m.put("tenSanPham",   r[1]);
            m.put("thuongHieu",   r[2]);
            m.put("daBan",        asLong(r[3]));
            m.put("doanhThu",     asBigDecimal(r[4]));
            m.put("tonKho",       asLong(r[5]));
            topBanChay.add(m);
        }

        List<Map<String, Object>> tonThap = new ArrayList<>();
        for (Object[] r : repo.tonKhoThap(NGUONG_TON_THAP)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("sanPhamId",  ((Number) r[0]).longValue());
            m.put("tenSanPham", r[1]);
            m.put("tonKho",     asLong(r[2]));
            m.put("sizeHetHang", asLong(r[3]));
            tonThap.add(m);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("period", period);
        res.put("tu", tu.toString());
        res.put("den", den.toString());

        Map<String, Object> kpi = new LinkedHashMap<>();
        kpi.put("tongDoanhThu", doanhThu);
        kpi.put("tangTruongDoanhThu", phanTramTang(doanhThu, doanhThuTruoc));   // % so kỳ trước
        kpi.put("doanhThuKyTruoc", doanhThuTruoc);
        kpi.put("tongDonHang", soDon);
        kpi.put("tangTruongDonHang", phanTramTang(BigDecimal.valueOf(soDon), BigDecimal.valueOf(soDonTruoc)));
        kpi.put("aov", aov);
        kpi.put("soDoiXuatKho", soDoiXuatKho);
        res.put("kpi", kpi);

        Map<String, Object> kenh = new LinkedHashMap<>();
        kenh.put("onlineDoanhThu", dtOnline);
        kenh.put("onlinePhanTram", phanTramOnline);
        kenh.put("posDoanhThu", dtPos);
        kenh.put("posPhanTram", phanTramPos);
        res.put("kenhBanHang", kenh);

        res.put("bieuDo7Ngay", bieuDo7Ngay);
        res.put("bieuDo7NgayPeak", peak);
        res.put("doanhThuTB7Ngay", doanhThuTB(theoNgay.values()));
        res.put("topBanChay", topBanChay);
        res.put("tonKhoThap", tonThap);
        res.put("nguongTonThap", NGUONG_TON_THAP);
        return res;
    }

    // ─────────────────────────────────────────────────────────────── helpers

    /** Xác định khoảng [tu, den) theo period. */
    private LocalDateTime[] khoangThoiGian(String period) {
        LocalDate today = LocalDate.now();
        return switch (period == null ? "7days" : period) {
            case "today" -> new LocalDateTime[]{ today.atStartOfDay(), today.plusDays(1).atStartOfDay() };
            case "month" -> new LocalDateTime[]{ today.withDayOfMonth(1).atStartOfDay(), today.plusDays(1).atStartOfDay() };
            case "year"  -> new LocalDateTime[]{ today.withDayOfYear(1).atStartOfDay(), today.plusDays(1).atStartOfDay() };
            default      -> new LocalDateTime[]{ today.minusDays(6).atStartOfDay(), today.plusDays(1).atStartOfDay() };
        };
    }

    /** Kỳ trước cùng độ dài, đứng ngay trước kỳ hiện tại (để tính % tăng trưởng). */
    private LocalDateTime[] khoangTruoc(String period, LocalDateTime tu, LocalDateTime den) {
        Duration length = Duration.between(tu, den);
        return new LocalDateTime[]{ tu.minus(length), tu };
    }

    /** % tăng trưởng so kỳ trước, làm tròn 1 chữ số thập phân. */
    private BigDecimal phanTramTang(BigDecimal hienTai, BigDecimal truoc) {
        if (truoc.signum() == 0) return hienTai.signum() == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(100);
        return hienTai.subtract(truoc)
                .multiply(BigDecimal.valueOf(100))
                .divide(truoc, 1, RoundingMode.HALF_UP);
    }

    private BigDecimal doanhThuTB(Collection<BigDecimal> values) {
        if (values.isEmpty()) return BigDecimal.ZERO;
        BigDecimal tong = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return tong.divide(BigDecimal.valueOf(values.size()), 0, RoundingMode.HALF_UP);
    }

    private BigDecimal asBigDecimal(Object o) {
        return o == null ? BigDecimal.ZERO : new BigDecimal(o.toString());
    }

    /** Native query trả về java.sql.Date hoặc java.sql.Timestamp tùy driver — xử lý cả hai. */
    private LocalDate toLocalDate(Object o) {
        if (o == null) return null;
        if (o instanceof java.sql.Date d) return d.toLocalDate();
        if (o instanceof java.sql.Timestamp ts) return ts.toLocalDateTime().toLocalDate();
        if (o instanceof LocalDate ld) return ld;
        return java.time.Instant.parse(o.toString()).atZone(ZoneId.systemDefault()).toLocalDate();
    }

    private long asLong(Object o) {
        return o == null ? 0 : (o instanceof Number n ? n.longValue() : Long.parseLong(o.toString()));
    }
}
