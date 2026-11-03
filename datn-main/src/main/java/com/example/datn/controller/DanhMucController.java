package com.example.datn.controller;

import com.example.datn.dto.DanhMucDTO;
import com.example.datn.dto.MauSacDTO;
import com.example.datn.dto.PageResponse;
import com.example.datn.entity.DanhMucEntity;
import com.example.datn.entity.MauSacEntity;
import com.example.datn.repository.DanhMucRepository;
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
@RequestMapping("/danh-muc")
public class DanhMucController {

    @Autowired
    private  DanhMucRepository repo;


    @GetMapping
    public ResponseEntity<List<DanhMucDTO>> getAll() {
        return ResponseEntity.ok(
                repo.findByTrangThaiTrueOrderByIdAsc().stream().map(this::toDTO).toList());
    }
    @GetMapping("/page")
    public PageResponse<DanhMucDTO> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Boolean trangThai) {

        size = Math.min(Math.max(size, 1), 100);
        page = Math.max(page, 0);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<DanhMucEntity> result = repo.search(q.trim(), trangThai, pageable);

        return PageResponse.of(result, result.getContent().stream().map(this::toDTO).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DanhMucDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toDTO(findActive(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<DanhMucDTO> create(@Valid @RequestBody DanhMucDTO dto) {
        String ma = dto.getMaDanhMuc().trim();
        if (repo.existsByMaDanhMuc(ma)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã danh mục đã tồn tại");
        }
        DanhMucEntity    e = DanhMucEntity.builder()
                .maDanhMuc(ma)
                .tenDanhMuc(dto.getTenDanhMuc().trim())
                .moTa(dto.getMoTa())
                .trangThai(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(repo.save(e)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<DanhMucDTO> update(@PathVariable Long id, @Valid @RequestBody DanhMucDTO dto) {
        DanhMucEntity e = findActive(id);
        String ma = dto.getMaDanhMuc().trim();
        if (repo.existsByMaDanhMucAndIdNot(ma, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã danh mục đã tồn tại");
        }
        e.setMaDanhMuc(ma);
        e.setTenDanhMuc(dto.getTenDanhMuc().trim());
        e.setMoTa(dto.getMoTa());
        return ResponseEntity.ok(toDTO(repo.save(e)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        DanhMucEntity e = findActive(id);
        e.setTrangThai(false);
        repo.save(e);
        return ResponseEntity.noContent().build();
    }

    private DanhMucEntity findActive(Long id) {
        return repo.findByIdAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));
    }

    private DanhMucDTO toDTO(DanhMucEntity e) {
        return DanhMucDTO.builder()
                .id(e.getId())
                .maDanhMuc(e.getMaDanhMuc())
                .tenDanhMuc(e.getTenDanhMuc())
                .moTa(e.getMoTa())
                .trangThai(e.getTrangThai())
                .build();
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<DanhMucDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Boolean trangThai = body.get("trangThai");
        if (trangThai == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu trường trangThai");
        }
        DanhMucEntity e = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy xuất xứ"));
        e.setTrangThai(trangThai);
        return ResponseEntity.ok(toDTO(repo.save(e)));
    }



}