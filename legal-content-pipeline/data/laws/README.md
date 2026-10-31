# Kho văn bản luật cho RAG

Mỗi file `.txt` = một văn bản. Dòng đầu bắt buộc:

```
# LAW: Bộ luật Dân sự 2015 | SOURCE: https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=...
```

Phần còn lại là **nguyên văn** văn bản (văn bản QPPL không được bảo hộ quyền tác giả — Điều 15 Luật SHTT).
Pipeline tự cắt theo dòng bắt đầu bằng `Điều N.`.

## Cách lấy văn bản
1. Vào https://vbpl.vn (Cơ sở dữ liệu quốc gia về văn bản pháp luật) → tìm văn bản → "Toàn văn".
2. Copy toàn bộ phần nội dung, dán vào file `.txt` dưới dòng `# LAW:`.
3. Với văn bản hợp nhất (ví dụ Luật SHTT sau sửa đổi 2022), ưu tiên **văn bản hợp nhất** để số điều khớp bản hiện hành.
4. Chạy `python run.py init` để dựng lại index.

## Bộ tối thiểu nên có (theo 3 trụ)
- `bo-luat-dan-su-2015.txt`
- `bo-luat-lao-dong-2019.txt`
- `bo-luat-hinh-su-2015-hop-nhat.txt` (Văn bản hợp nhất 135/VBHN-VPQH ngày 05/9/2025 — đã gồm Luật 12/2017/QH14, Luật 59/2024/QH15 và Luật 86/2025/QH15)
- `bo-luat-to-tung-hinh-su-2015.txt`
- `nghi-dinh-21-2021.txt` (bảo đảm thực hiện nghĩa vụ)
- `nghi-dinh-12-2022.txt` (xử phạt hành chính lao động)
- `luat-bhxh-2024.txt`

File `_mau.txt` chỉ để chạy demo — **xóa khi đã có văn bản thật**.
