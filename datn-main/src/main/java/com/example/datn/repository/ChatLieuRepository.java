package com.example.datn.repository;

import com.example.datn.entity.ChatLieuEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatLieuRepository extends JpaRepository<ChatLieuEntity, Long> {

    List<ChatLieuEntity> findByTrangThaiTrueOrderByIdAsc();

    Optional<ChatLieuEntity> findByIdAndTrangThaiTrue(Integer id);

    boolean existsByMaChatLieu(String maChatLieu);

    boolean existsByMaChatLieuAndIdNot(String maChatLieu, Integer id);

    @Query("""
       SELECT t FROM ChatLieuEntity t
       WHERE (:q = '' OR LOWER(t.tenChatLieu) LIKE LOWER(CONCAT('%', :q, '%'))
                      OR LOWER(t.maChatLieu)  LIKE LOWER(CONCAT('%', :q, '%')))
         AND (:trangThai IS NULL OR t.trangThai = :trangThai)
       """)
    Page<ChatLieuEntity> search(@Param("q") String q,
                                @Param("trangThai") Boolean trangThai,
                                Pageable pageable);
}