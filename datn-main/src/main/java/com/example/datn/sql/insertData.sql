
INSERT INTO VAI_TRO (ma_vai_tro, ten_vai_tro, mo_ta, trang_thai)
VALUES
    ('ADMIN', N'Quản trị viên', N'Tài khoản quản trị hệ thống', 1),
    ('NHAN_VIEN', N'Nhân viên', N'Tài khoản nhân viên bán hàng / quản lý', 1),
    ('KHACH_HANG', N'Khách hàng', N'Tài khoản khách hàng mua hàng', 1);



INSERT INTO NHAN_VIEN (ma_nhan_vien, ho_ten, sdt, email, mat_khau, vai_tro_id, trang_thai)
VALUES
    ('NV001', N'Nguyễn Văn Admin', '0550000888', 'admin@vibeflow.com', '$2a$12$X.RO2ZcEnew4bh4jAJoX/ezz1YWl.rMRIZGs1DYASB6wEK5jD1dMm', 1, 1),
    ('NV002', N'Trần Thị Nhân Viên', '0550000156', 'nhanvien01@vibeflow.com', '$2a$12$X.RO2ZcEnew4bh4jAJoX/ezz1YWl.rMRIZGs1DYASB6wEK5jD1dMm', 2, 1);

INSERT INTO KHACH_HANG (ma_khach_hang, ho_ten, sdt, email, ngay_sinh, gioi_tinh, trang_thai, mat_khau)
VALUES
    ('KH001', N'Nguyễn Văn An', '0912345678', 'nguyenvanan@gmail.com', '1998-05-20', 1, 1, '$2a$12$X.RO2ZcEnew4bh4jAJoX/ezz1YWl.rMRIZGs1DYASB6wEK5jD1dMm');