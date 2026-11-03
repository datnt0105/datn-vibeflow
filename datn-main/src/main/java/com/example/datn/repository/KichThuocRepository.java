package com.example.datn.repository;

import com.example.datn.entity.KichThuocEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KichThuocRepository extends JpaRepository<KichThuocEntity, Long> {

    Optional<KichThuocEntity> findByMaKichThuoc(String maKichThuoc);

    boolean existsByMaKichThuoc(String maKichThuoc);

    List<KichThuocEntity> findByTrangThaiTrueOrderByIdAsc();

    Optional<KichThuocEntity> findByIdAndTrangThaiTrue(Long id);

    boolean existsByMaKichThuocAndIdNot(String maKichThuoc, Long id);

    @Query("""
       SELECT t FROM KichThuocEntity t
       WHERE (:q = '' OR LOWER(t.tenKichThuoc) LIKE LOWER(CONCAT('%', :q, '%'))
                      OR LOWER(t.maKichThuoc)  LIKE LOWER(CONCAT('%', :q, '%')))
         AND (:trangThai IS NULL OR t.trangThai = :trangThai)
       """)
    Page<KichThuocEntity> search(@Param("q") String q,
                                 @Param("trangThai") Boolean trangThai,
                                 Pageable pageable);
}

