package com.example.datn.service;

import java.util.function.Predicate;

/**
 * Sinh mã tuần tự dạng PREFIX + 4 chữ số (KH0001, NV0001).
 * Bắt đầu từ (số bản ghi + 1) và tăng dần cho tới khi gặp mã chưa tồn tại.
 */
public final class MaGenerator {

    private MaGenerator() {
    }

    public static String next(String prefix, long currentCount, Predicate<String> exists) {
        long n = currentCount + 1;
        String ma = String.format("%s%04d", prefix, n);
        while (exists.test(ma)) {
            n++;
            ma = String.format("%s%04d", prefix, n);
        }
        return ma;
    }
}
