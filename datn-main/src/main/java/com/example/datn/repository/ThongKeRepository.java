package com.example.datn.repository;

import com.example.datn.entity.HoaDonEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Truy vấn thống kê cho Dashboard — mọi số liệu đều tính từ HOA_DON / HOA_DON_CHI_TIET.
 *  Kênh bán phân biệt qua trang_thai: 1 = POS tại quầy, 2 = Online (đặt theo giao diện Admin).
 *  (Đặt cùng package repository; không đụng HoaDonRepository hiện có.) */
public interface ThongKeRepository extends org.springframework.data.jpa.repository.JpaRepository<HoaDonEntity, Integer> {

    // ── KPI theo kỳ ─────────────────────────────────────────────────────────

    /** Doanh thu (thanh_tien) + số đơn + số đôi xuất kho trong khoảng thời gian.
     *  COUNT(DISTINCT h) vì JOIN chi tiết làm nhân bản dòng hóa đơn. */
    @Query("""
           SELECT COALESCE(SUM(h.thanhTien), 0), COUNT(DISTINCT h),
                  COALESCE(SUM(ct.soLuong), 0)
           FROM HoaDonEntity h
           LEFT JOIN HoaDonChiTietEntity ct ON ct.hoaDon = h
           WHERE h.ngayTao >= :tu AND h.ngayTao < :den
           """)
    Object[] tongHopTheoKy(@Param("tu") LocalDateTime tu, @Param("den") LocalDateTime den);

    /** Doanh thu Online (trang_thai = 2) trong kỳ. */
    @Query("""
           SELECT COALESCE(SUM(h.thanhTien), 0)
           FROM HoaDonEntity h
           WHERE h.ngayTao >= :tu AND h.ngayTao < :den AND h.trangThai = 2
           """)
    BigDecimal doanhThuOnline(@Param("tu") LocalDateTime tu, @Param("den") LocalDateTime den);

    /** Doanh thu POS (trang_thai = 1) trong kỳ. */
    @Query("""
           SELECT COALESCE(SUM(h.thanhTien), 0)
           FROM HoaDonEntity h
           WHERE h.ngayTao >= :tu AND h.ngayTao < :den AND h.trangThai = 1
           """)
    BigDecimal doanhThuPos(@Param("tu") LocalDateTime tu, @Param("den") LocalDateTime den);

    /** Doanh thu kỳ trước (để so sánh % tăng trưởng trên KPI card). */
    @Query("""
           SELECT COALESCE(SUM(h.thanhTien), 0), COUNT(h)
           FROM HoaDonEntity h
           WHERE h.ngayTao >= :tu AND h.ngayTao < :den
           """)
    Object[] tongHopKyTruoc(@Param("tu") LocalDateTime tu, @Param("den") LocalDateTime den);

    // ── Biểu đồ 7 ngày ──────────────────────────────────────────────────────

    /** Doanh thu từng ngày (group theo ngày) — FE dựng cột biểu đồ. */
    @Query(value = """
           SELECT CONVERT(date, h.ngay_tao) AS ngay,
                  COALESCE(SUM(h.thanh_tien), 0) AS doanhThu
           FROM hoa_don h
           WHERE h.ngay_tao >= :tu AND h.ngay_tao < :den
           GROUP BY CONVERT(date, h.ngay_tao)
           ORDER BY CONVERT(date, h.ngay_tao)
           """, nativeQuery = true)
    List<Object[]> doanhThuTheoNgay(@Param("tu") LocalDateTime tu, @Param("den") LocalDateTime den);

    // ── Top bán chạy ────────────────────────────────────────────────────────

    /** Top N sản phẩm bán chạy trong kỳ: id, tên, thương hiệu, số đôi bán, doanh thu, tồn hiện tại. */
    @Query(value = """
           SELECT sp.id, sp.ten_san_pham, th.ten_thuong_hieu,
                  SUM(ct.so_luong)                    AS daBan,
                  SUM(ct.thanh_tien)                  AS doanhThu,
                  COALESCE((SELECT SUM(k.so_luong)
                            FROM chi_tiet_san_pham k
                            WHERE k.san_pham_id = sp.id AND k.trang_thai = 1), 0) AS tonKho
           FROM hoa_don_chi_tiet ct
           JOIN hoa_don h ON h.id = ct.hoa_don_id
           JOIN chi_tiet_san_pham csp ON csp.id = ct.chi_tiet_san_pham_id
           JOIN san_pham sp ON sp.id = csp.san_pham_id
           LEFT JOIN thuong_hieu th ON th.id = sp.thuong_hieu_id
           WHERE h.ngay_tao >= :tu AND h.ngay_tao < :den
           GROUP BY sp.id, sp.ten_san_pham, th.ten_thuong_hieu
           ORDER BY daBan DESC
           """, nativeQuery = true)
    List<Object[]> topBanChay(@Param("tu") LocalDateTime tu,
                              @Param("den") LocalDateTime den,
                              org.springframework.data.domain.Pageable pageable);

    // ── Cảnh báo tồn kho thấp ───────────────────────────────────────────────

    /** Sản phẩm có tổng tồn < ngưỡng: id, tên, tổng tồn, số size đã hết hàng. */
    @Query(value = """
           SELECT sp.id, sp.ten_san_pham,
                  COALESCE(SUM(k.so_luong), 0) AS tonKho,
                  SUM(CASE WHEN k.so_luong = 0 THEN 1 ELSE 0 END) AS sizeHetHang
           FROM san_pham sp
           JOIN chi_tiet_san_pham k ON k.san_pham_id = sp.id AND k.trang_thai = 1
           WHERE sp.trang_thai = 1
           GROUP BY sp.id, sp.ten_san_pham
           HAVING COALESCE(SUM(k.so_luong), 0) < :nguong
           ORDER BY tonKho ASC
           """, nativeQuery = true)
    List<Object[]> tonKhoThap(@Param("nguong") int nguong);
}
