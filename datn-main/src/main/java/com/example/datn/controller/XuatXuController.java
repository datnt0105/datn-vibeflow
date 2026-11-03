package com.example.datn.controller;

import com.example.datn.dto.PageResponse;
import com.example.datn.dto.ThuongHieuDTO;
import com.example.datn.dto.XuatXuDTO;
import com.example.datn.entity.ThuongHieuEntity;
import com.example.datn.entity.XuatXuEntity;
import com.example.datn.repository.XuatXuRepository;
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
@RequestMapping("/xuat-xu")
public class XuatXuController {

    @Autowired
    private  XuatXuRepository repo;

    public XuatXuController(XuatXuRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<XuatXuDTO>> getAll() {
        return ResponseEntity.ok(
                repo.findByTrangThaiTrueOrderByIdAsc().stream().map(this::toDTO).toList());
    }
    @GetMapping("/page")
    public PageResponse<XuatXuDTO> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Boolean trangThai) {

        size = Math.min(Math.max(size, 1), 100);
        page = Math.max(page, 0);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<XuatXuEntity> result = repo.search(q.trim(), trangThai, pageable);

        return PageResponse.of(result, result.getContent().stream().map(this::toDTO).toList());
    }

    private XuatXuEntity findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<XuatXuDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(toDTO(findActive(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<XuatXuDTO> create(@Valid @RequestBody XuatXuDTO dto) {
        String ma = dto.getMaXuatXu().trim();
        if (repo.existsByMaXuatXu(ma)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã xuất xứ đã tồn tại");
        }
        XuatXuEntity e = XuatXuEntity.builder()
                .maXuatXu(ma)
                .tenXuatXu(dto.getTenXuatXu().trim())
                .moTa(dto.getMoTa())
                .trangThai(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(repo.save(e)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<XuatXuDTO> update(@PathVariable Long id, @Valid @RequestBody XuatXuDTO dto) {
        XuatXuEntity e = findActive(id);
        String ma = dto.getMaXuatXu().trim();
        if (repo.existsByMaXuatXuAndIdNot(ma, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã xuất xứ đã tồn tại");
        }
        e.setMaXuatXu(ma);
        e.setTenXuatXu(dto.getTenXuatXu().trim());
        e.setMoTa(dto.getMoTa());
        return ResponseEntity.ok(toDTO(repo.save(e)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        XuatXuEntity e = findActive(id);
        e.setTrangThai(false);
        repo.save(e);
        return ResponseEntity.noContent().build();
    }

    private XuatXuEntity findActive(Long id) {
        return repo.findByIdAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy xuất xứ"));
    }

    private XuatXuDTO toDTO(XuatXuEntity e) {
        return XuatXuDTO.builder()
                .id(e.getId())
                .maXuatXu(e.getMaXuatXu())
                .tenXuatXu(e.getTenXuatXu())
                .moTa(e.getMoTa())
                .trangThai(e.getTrangThai())
                .build();
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<XuatXuDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Boolean trangThai = body.get("trangThai");
        if (trangThai == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu trường trangThai");
        }
        XuatXuEntity e = findById(id);
        e.setTrangThai(trangThai);
        return ResponseEntity.ok(toDTO(repo.save(e)));
    }
}