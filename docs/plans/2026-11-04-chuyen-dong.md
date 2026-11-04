# Sổ việc — Nâng cấp tủ trưng bày sự nghiệp, làm mượt toàn web, hiệu ứng thắp chuỗi + animation chức năng (04/11/2026)

Nhánh: `claude/kind-archimedes-oxfd21`. Tự làm tuần tự (CLAUDE.md cấm fan-out cho việc < 1 ngày). Không thêm thư viện.
Ràng buộc chung: chỉ animate `transform`/`opacity`/`filter` nhẹ; mọi hiệu ứng tôn trọng `prefers-reduced-motion`.

Quyết định: màn thắp chuỗi chạy **mỗi ngày** lần đầu chuỗi tăng — vì đã có cơ chế `justLit` theo ngày — sai thì tốn: đổi 1 điều kiện.
Quyết định: màn thắp hiện ở **cuối phiên học** (SessionEnd), lúc chuỗi vừa cộng — vì đó là khoảnh khắc thật — sai thì tốn: đổi chỗ gắn component.
Quyết định: Hào chọn "làm tất cả" 9 mục trong 1 phiên; vẫn giữ mốc dừng-báo-cáo 2 giờ của CLAUDE.md.

| # | Task | File chính | Kiểm tra |
|---|---|---|---|
| 1 | Bộ thông số chuyển động chung + hiệu năng (dừng animation ngoài màn hình/tab ẩn, content-visibility) | app.css, StreakCard, fx/ | `npm run ci`; đo khung hình trước/sau |
| 2 | Tủ trưng bày: nền/đồ vật đúng logic nhánh–cấp, nền mới trụ sở VKS/UBND, chi tiết áo | game/looks.ts, art/showcase, art/Portrait | test looks mới đỏ→xanh; shots |
| 3 | Màn thắp chuỗi toàn màn hình (FLIP, đốm sáng bay tới số + ký hoạ, số sáng rồi tắt) | art/StreakIgnite.svelte, SessionEnd | test logic bật; shots |
| 4 | Chuyển trang bằng View Transitions | router, Shell | ci |
| 5 | Phản hồi trả lời: đúng sáng viền, sai rung; thẻ kế trượt vào; thanh tiến độ mượt | app.css, cards/ | ci |
| 6 | Số đếm tăng dần (XP, % tiến độ) | ui/CountUp.svelte | test hàm nội suy |
| 7 | Thăng chức: ô chức sáng, tủ đổi áo/nền mờ chéo | OrgChart, CareerSection | ci |
| 8 | Skeleton khi tải + danh sách hiện lần lượt | Shell/routes | ci |
| 9 | Bottom sheet kéo xuống để đóng | sheet | ci |

## Nhật ký
Task 1: bắt đầu — base 7665b2c
Đo (Chromium CPU chậm 4×, 390 px, chuỗi 12 ngày, thời gian bận luồng chính trong 4 s, script scratchpad perf.cjs):
- trước: Hôm nay 817 ms · Hồ sơ 1788 ms (ổn định sau 14 s); 811/1610 ms (ngay khi mở)
- sau Task 1: Hôm nay 90 ms · Hồ sơ 547 ms (ổn định); ngay khi mở Hồ sơ 752 ms
- Nguyên nhân: animation trong <svg> có filter/mask bắt vẽ lại + layout lại cả khối mỗi khung hình (cảnh đầu trang: 242 lần layout/4 s); `orgnext` animate box-shadow.
- Sửa: lib/fx/motionGate.ts (dừng khi ngoài màn hình/tab ẩn, lắng sau 12–15 s, rê chuột chạy lại); vân giấy thành ảnh dựng sẵn; orgnext/firepulse chuyển sang ::before/::after opacity+transform; token --dur-1..4, --ease-*.
Task 1: xong — a662e13
Task 2: bắt đầu — base a662e13
Task 2: phông theo nơi làm việc (5 cảnh mới ScenesCongSo: trụ sở xã, tỉnh, bộ, Viện kiểm sát, dinh thự nguyên thủ; xét xử/kiểm sát dùng thêm phòng xử án), luật vải theo cấp (đồng phục trơn, không nơ, chấm bi/ca-rô chỉ cấp cơ sở), đồ vật đúng nghề. Ảnh: docs/plans/2026-11-04-tu-trung-bay-sau.png.
Quyết định: bỏ test cũ "≥ 12 phông, không phông nào quá 5 chức" — vì chính ràng buộc đa dạng đó ép Thẩm phán đứng trước đình làng — sai thì tốn: khôi phục test + bảng cũ (1 commit).
Chưa chắc: trang phục Thư ký Tòa án tại phiên tòa (giữ công sở như cũ, không đổi).
Task 2: xong — fa968f7
Task 3: bắt đầu — base fa968f7
Task 3: xong — ab388ed (ảnh khung hình: docs/plans/2026-11-04-man-thap-chuoi.png; e2e lesson.spec.ts 3/3 xanh)
DỪNG theo mốc 2 giờ của CLAUDE.md. Task 4–9 chưa bắt đầu — phiên sau làm tiếp từ Task 4, không làm lại 1–3.
Rút kinh nghiệm: (1) đo hiệu năng phải ép khung hình bằng vòng requestAnimationFrame — chờ suông thì Chromium headless không vẽ, số liệu sai (lần đo đầu ra 18 ms thay vì ~750 ms). (2) Test ràng buộc "đa dạng" cũ (≥ 12 phông) chính là nguyên nhân lỗi logic — test thẩm mỹ nên ràng buộc ý nghĩa trước, đa dạng sau. (3) Overlay mới che màn kết thúc → phải rà mọi e2e có thao tác sau màn đó; jsdom không có Element.animate → luôn bọc kiểm tra.

## Phiên tiếp (Hào: "tiếp tục; ở thẻ chỉ con số sáng lên, thêm animation tăng số")
- Sửa màn thắp: bỏ đĩa sáng sau số, chỉ chữ số bừng sáng rồi tắt; số đổi kiểu đồng hồ đếm (số cũ trượt lên, số mới trượt vào) — 469c4dd.
- Task 4: xong — bce4ccf (View Transitions; focus tiêu đề chuyển vào trong callback).
- Task 5–9: xong — các commit feat(phien-hoc), feat(ui) số đếm, feat(su-nghiep) mờ chéo + ô chức mới, khung chờ, ngăn kéo kéo xuống.
- Review cuối (dp-review, opus): 1 CẦN_SỬA + 2 NÊN_SỬA, đã sửa ở 532cf8d. Còn GHI_CHÚ chưa xử lý: okring animate clip-path (0,9 s, một phần tử); thanh tiến độ animate width; 22 đốm sáng có box-shadow + blend trên nền blur; chuyển trang tới màn nạp lười chụp lúc khung xương còn mờ (màn mới trượt vào trống ~150 ms); chưa có test component cho StreakIgnite/CountUp/Sheet.
- Đo cuối (CPU chậm 4×, ổn định): Hôm nay 81 ms (đầu phiên 817), Hồ sơ 661–729 ms (đầu phiên 1788; sau Task 1 là 547 — dao động, bisect không ra một khối thủ phạm).
- e2e: 28/29; đỏ duy nhất home-review-quiz "BẮT ĐẦU" là lỗi có sẵn từ trước nhánh (nhãn không còn in hoa sau audit) — ngoài phạm vi, chưa sửa.
Rút kinh nghiệm: (4) cổng chuyển động "lắng" phải được đánh thức bởi MỌI nguồn kích hoạt hiệu ứng (prop celebrate), không chỉ rê chuột — reviewer bắt được, test hàm thuần không bắt được. (5) Component hiển thị số liệu bất đồng bộ cần cờ "đã tải" — giá trị mặc định 0 không phải dữ liệu.
