# SPEC — video giới thiệu Luyện Luật (bản 4)

MỤC TIÊU:  người xem (sinh viên luật, người 18–30 hay gặp chuyện cọc/thuê/vay) thấy một câu hỏi tiền bạc đời thường được trả lời chắc, có căn cứ, rồi muốn vào web luyện.
ĐẦU RA:    Remotion, 1080×1920 @ 60 fps, 28 ô = 60,5 s (3,5 cụm nhạc).
THỜI GIAN: "Aura Farming" (Mustafa Saboori, bản gốc) 111 BPM → 32,43 khung/phách; cụm 8 ô, bass tắt 1,5 phách cuối cụm;
           cú nện đầu cụm ở 0:17,3 · 0:34,6 · 0:51,9; số chuỗi đổi 74 → 75 ở 0:43,2 (phách 80); nhận chức ở 0:54,1 (phách 100).
NHÌN:      chất liệu của web "Văn Miếu": giấy #f7f4ee (hạt 7 %), mực #14213d, cam #d97a1e (nhấn: 1 chữ/cảnh, mảng màu ở hook),
           son #b3261e (chỉ dấu §), xanh #1f7a4d (đúng/xác nhận). Tiêu đề Noto Serif Display 800, chữ Be Vietnam Pro 700–800.
           Mảng màu phẳng toàn khung (cam, mực) thay cho nền tối có glow; KHÔNG bật particles/rays.
VẬT:       điện thoại thật (bản quay web), thẻ chuyên cần đen kim loại (component thật), tủ trưng bày chức danh (component thật),
           bìa/tranh tự vẽ của web, icon nét mảnh của web.
CHUYỂN ĐỘNG: vào = nhoè→nét theo từ (đuôi expo); chữ chốt = nện (phóng 1,8→1 + nhoè 14 px, 10 khung); lò xo damping ~0,75;
           whip 9 khung có nhoè 24 px (cảnh cũ nằm dưới, không lộ đen); đầu cụm: zoom 1,25→1 trong 18 khung;
           bass tắt: hút vào (phóng +20 %, nhoè 7 px, nhạt màu 75 %, tối viền 80 %).
CẢNH:
  c1  0–2 ô   hook      mảng cam; "Đặt cọc 20 triệu / chủ nhà bán người khác / ĐƯỢC TRẢ BAO NHIÊU?" nện theo phách
  c1  2–4     logo      giấy + Khuê Văn Các; dấu § son đóng xuống (nện)
  c1  4–8     thẻ       Hiểu nhanh "Đặt cọc": 4 nhánh có icon vẽ dần theo phách, mẹo nhớ gạch chân; hút vào cuối cụm
  c2  8–10    đáp       mảng mực; "Chủ nhà bỏ cuộc → TRẢ 40 TRIỆU"
  c2  10–13   đề        bản quay web: chọn đáp án ở phách 2 → dấu đúng + căn cứ Khoản 1 Điều 328
  c2  13–16   bậc       6 bậc, mỗi bậc vào trên 1,5 phách; hút vào cuối cụm
  c3  16–18   FSRS      đường quên vẽ dần, 3 mốc ôn
  c3  18–22   chuỗi     bản quay màn thắp chuỗi, số đổi đúng phách 8 (cú chốt lớn nhất, 60–75 % thời lượng)
  c3  22–24   chu kỳ    4 thẻ lật theo 2 phách: Đỏ, Xanh lam, Tím, Trắng – đen giao thoa
  c4  24–26   chức      4 tủ trưng bày đổi theo phách → nhận chức Chủ tịch nước (phách 4)
  c4  26–28   kết       § + Luyện Luật + Miễn phí · Không cần tài khoản + Link ở bio; miễn trừ
CẤM:       danh sách mặc định (skill motion-video) + bản này: nền xanh đen có glow/hạt bay, chip viên thuốc, slide liệt kê tính năng không có ví dụ,
           thẻ chữ > thời gian đọc, chớp trắng loá trên nền giấy, khung đen ở điểm cắt.
QA:        khung 0 (hook đọc được), 2 khung sau mỗi cú nện, giữa mỗi khoảng bass tắt, phách 80 (số đổi), phách 100 (nhận chức), khung cuối.
