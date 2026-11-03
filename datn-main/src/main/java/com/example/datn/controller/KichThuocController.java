package com.example.datn.controller;

import com.example.datn.dto.KichThuocDTO;
import com.example.datn.dto.PageResponse;
import com.example.datn.entity.KichThuocEntity;
import com.example.datn.repository.KichThuocRepository;
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
@RequestMapping("/kich-thuoc")
public class KichThuocController {
    @Autowired
    private  KichThuocRepository repo;

    public KichThuocController() { }
    private KichThuocDTO toDTO(KichThuocEntity e) {
        return KichThuocDTO.builder()
                .id(e.getId())
                .maKichThuoc(e.getMaKichThuoc())
                .tenKichThuoc(e.getTenKichThuoc())
                .trangThai(Boolean.TRUE.equals(e.getTrangThai()))
                .build();
    }

    @GetMapping
    public List<KichThuocEntity> getAll() {
        return repo.findByTrangThaiTrueOrderByIdAsc();
    }
    @GetMapping("/page")
    public PageResponse<KichThuocDTO> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Boolean trangThai) {

        size = Math.min(Math.max(size, 1), 100);
        page = Math.max(page, 0);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<KichThuocEntity> result = repo.search(q.trim(), trangThai, pageable);

        return PageResponse.of(result, result.getContent().stream().map(this::toDTO).toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<KichThuocDTO> create(@Valid @RequestBody KichThuocDTO dto) {
        String ma = dto.getMaKichThuoc().trim();
        if (repo.existsByMaKichThuoc(ma)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã kích thước đã tồn tại");
        }
        KichThuocEntity e = KichThuocEntity.builder()
                .maKichThuoc(ma)
                .tenKichThuoc(dto.getTenKichThuoc().trim())
                .trangThai(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(repo.save(e)));
    }

    private KichThuocEntity findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy kích thước"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<KichThuocDTO> update(@PathVariable Long id, @Valid @RequestBody KichThuocDTO dto) {
        KichThuocEntity e = findById(id);
        String ma = dto.getMaKichThuoc().trim();
        if (repo.existsByMaKichThuocAndIdNot(ma, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã kích thước đã tồn tại");
        }
        e.setMaKichThuoc(ma);
        e.setTenKichThuoc(dto.getTenKichThuoc().trim());
        return ResponseEntity.ok(toDTO(repo.save(e)));
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<KichThuocDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Boolean trangThai = body.get("trangThai");
        if (trangThai == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu trường trangThai");
        }
        KichThuocEntity e = findById(id);
        e.setTrangThai(trangThai);
        return ResponseEntity.ok(toDTO(repo.save(e)));
    }
}
