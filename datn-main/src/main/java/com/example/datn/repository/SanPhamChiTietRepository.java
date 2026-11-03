package com.example.datn.repository;

import com.example.datn.entity.SanPhamChiTietEntity;
import com.example.datn.entity.SanPhamEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamChiTietRepository extends JpaRepository<SanPhamChiTietEntity, Long> {

    Optional<SanPhamChiTietEntity> findByMaChiTiet(String maChiTiet);

    boolean existsByMaChiTiet(String maChiTiet);

    List<SanPhamChiTietEntity> findBySanPham_Id(Long sanPhamId);

    List<SanPhamChiTietEntity> findByTrangThai(Boolean trangThai);



    @Query("""
       SELECT c FROM SanPhamChiTietEntity c
       JOIN FETCH c.sanPham
       JOIN FETCH c.mauSac
       JOIN FETCH c.kichThuoc
       WHERE c.sanPham.id = :sanPhamId AND c.trangThai = true
       """)
    List<SanPhamChiTietEntity> findActiveBySanPham(@Param("sanPhamId") Long sanPhamId);

    Optional<SanPhamChiTietEntity> findByIdAndTrangThaiTrue(Long id);

    boolean existsBySanPham_IdAndMauSac_IdAndKichThuoc_IdAndTrangThaiTrue(
            Long sanPhamId, Long mauSacId, Long kichThuocId);
    @Query("""
       SELECT c.sanPham.id, SUM(c.soLuong)
       FROM SanPhamChiTietEntity c
       WHERE c.sanPham.id IN :ids AND c.trangThai = true
       GROUP BY c.sanPham.id
       """)
    List<Object[]> sumSoLuongBySanPhamIds(@Param("ids") List<Long> ids);
}