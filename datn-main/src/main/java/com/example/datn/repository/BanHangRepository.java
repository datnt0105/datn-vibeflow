package com.example.datn.repository;

import com.example.datn.entity.SanPhamChiTietEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Hỗ trợ màn hình Bán Hàng POS.
 * Lưu ý: không giảm tồn kho trực tiếp từ đây — nghiệp vụ trừ kho nằm ở BanHangService
 * (hiện POS chưa lưu hóa đơn nên chỉ dùng để kiểm tra tồn).
 */
public interface BanHangRepository extends JpaRepository<SanPhamChiTietEntity, Long> {

    /**
     * Danh sách biến thể đang bán cho 1 sản phẩm: id, mã chi tiết, tên màu, hex, tên size,
     * số lượng, giá bán hiệu lực (giá biến thể, nếu null thì theo giá sản phẩm).
     */
    @Query(value = """
           SELECT k.id,
                  k.ma_chi_tiet,
                  ms.ten_mau,
                  ms.ma_hex,
                  kt.ten_kich_thuoc,
                  k.so_luong,
                  COALESCE(k.gia_ban, sp.gia_ban) AS giaHieuLuc
           FROM chi_tiet_san_pham k
           JOIN san_pham sp  ON sp.id = k.san_pham_id
           JOIN mau_sac ms   ON ms.id = k.mau_sac_id
           JOIN kich_thuoc kt ON kt.id = k.kich_thuoc_id
           WHERE k.san_pham_id = :sanPhamId
             AND k.trang_thai = 1
             AND sp.trang_thai = 1
           ORDER BY kt.ten_kich_thuoc
           """, nativeQuery = true)
    List<Object[]> findBienTheBanHang(@Param("sanPhamId") Integer sanPhamId);
}
