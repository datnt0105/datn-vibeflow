package com.example.datn.repository;

import com.example.datn.entity.ThuongHieuEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThuongHieuRepository extends JpaRepository<ThuongHieuEntity, Long> {

    Optional<ThuongHieuEntity> findByMaThuongHieu(String maThuongHieu);

    boolean existsByMaThuongHieu(String maThuongHieu);

    boolean existsByMaThuongHieuAndIdNot(String maThuongHieu, Long id);

    @Query("""
       SELECT t FROM ThuongHieuEntity t
       WHERE (:q = '' OR LOWER(t.tenThuongHieu) LIKE LOWER(CONCAT('%', :q, '%'))
                      OR LOWER(t.maThuongHieu)  LIKE LOWER(CONCAT('%', :q, '%')))
         AND (:trangThai IS NULL OR t.trangThai = :trangThai)
       """)
    Page<ThuongHieuEntity> search(@Param("q") String q,
                                  @Param("trangThai") Boolean trangThai,
                                  Pageable pageable);
}