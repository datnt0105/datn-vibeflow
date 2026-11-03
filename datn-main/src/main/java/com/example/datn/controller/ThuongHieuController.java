package com.example.datn.controller;

import com.example.datn.dto.PageResponse;
import com.example.datn.dto.SanPhamDTO;
import com.example.datn.dto.ThuongHieuDTO;
import com.example.datn.entity.ThuongHieuEntity;
import com.example.datn.repository.ThuongHieuRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/thuong-hieu")
public class ThuongHieuController {
    @Autowired
    private ThuongHieuRepository thuongHieuRepository;

    @GetMapping
    public ResponseEntity<List<ThuongHieuEntity>> getAll() {
        return ResponseEntity.ok(thuongHieuRepository.findAll());
    }

    private ThuongHieuDTO toDTO(ThuongHieuEntity e) {
        return ThuongHieuDTO.builder()
                .id(e.getId())
                .maThuongHieu(e.getMaThuongHieu())
                .tenThuongHieu(e.getTenThuongHieu())
                .moTa(e.getMoTa())
                .trangThai(Boolean.TRUE.equals(e.getTrangThai()))
                .build();
    }

    private ThuongHieuEntity findById(Long id) {
        return thuongHieuRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu"));
    }
    @GetMapping("/page")
    public PageResponse<ThuongHieuDTO> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Boolean trangThai) {

        size = Math.min(Math.max(size, 1), 100);
        page = Math.max(page, 0);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<ThuongHieuEntity> result = thuongHieuRepository.search(q.trim(), trangThai, pageable);

        return PageResponse.of(result, result.getContent().stream().map(this::toDTO).toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ThuongHieuDTO> create(@Valid @RequestBody ThuongHieuDTO dto) {
        String ma = dto.getMaThuongHieu().trim();
        if (thuongHieuRepository.existsByMaThuongHieu(ma)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã thương hiệu đã tồn tại");
        }
        ThuongHieuEntity e = ThuongHieuEntity.builder()
                .maThuongHieu(ma)
                .tenThuongHieu(dto.getTenThuongHieu().trim())
                .moTa(dto.getMoTa())
                .trangThai(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(thuongHieuRepository.save(e)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ThuongHieuDTO> update(@PathVariable Long id, @Valid @RequestBody ThuongHieuDTO dto) {
        ThuongHieuEntity e = findById(id);
        String ma = dto.getMaThuongHieu().trim();
        if (thuongHieuRepository.existsByMaThuongHieuAndIdNot(ma, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã thương hiệu đã tồn tại");
        }
        e.setMaThuongHieu(ma);
        e.setTenThuongHieu(dto.getTenThuongHieu().trim());
        e.setMoTa(dto.getMoTa());
        return ResponseEntity.ok(toDTO(thuongHieuRepository.save(e)));
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ThuongHieuDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Boolean trangThai = body.get("trangThai");
        if (trangThai == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu trường trangThai");
        }
        ThuongHieuEntity e = findById(id);
        e.setTrangThai(trangThai);
        return ResponseEntity.ok(toDTO(thuongHieuRepository.save(e)));
    }
}
