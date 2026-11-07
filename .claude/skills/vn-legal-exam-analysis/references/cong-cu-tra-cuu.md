# Công cụ tra cứu — biến bước 6 thành thao tác trong môi trường Claude

`quy-trinh-xac-minh.md` nói tra **cái gì** và **theo thứ tự nào**. File này nói tra **bằng công cụ nào** trong môi trường Claude (claude.ai và Claude Code), vì công cụ nào đọc được nguồn nào là dữ kiện kỹ thuật thay đổi theo thời gian, không suy ra được từ lý thuyết. Các nhận xét dưới đây đã kiểm chứng ngày 30/10/2026; nếu một công cụ trả kết quả khác mô tả, tin kết quả thật và ghi lại.

## Bảng chọn công cụ

| Việc | Công cụ ưu tiên | Ghi chú |
|---|---|---|
| Chỉ nhớ nội dung, không nhớ số điều/số hiệu | Legal Data Hunter `search` (mục riêng bên dưới) | Trả về đúng cấp Điều kèm nguyên văn và link vbpl.vn — nhưng có cả luật đã hết hiệu lực, phải lọc theo năm và kiểm hiệu lực |
| Tìm văn bản theo số hiệu, xem tình trạng hiệu lực | Parallel Search `web_search` | Kết quả có đoạn trích của chính trang vbpl.vn, thường gồm "Còn hiệu lực/Hết hiệu lực một phần", ngày có hiệu lực, ngày cập nhật. Gộp nhiều văn bản vào một lần gọi bằng nhiều `search_queries` |
| Đọc nguyên văn một điều, khoản | Parallel Search `web_fetch` trên URL vbpl.vn, `objective` nêu rõ Điều + cụm từ đặc trưng | Trang vbpl.vn render bằng JavaScript; công cụ này đọc được và chỉ trả phần liên quan, tiết kiệm ngữ cảnh |
| Dự phòng khi Parallel không có kết quả | Firecrawl `firecrawl_scrape` (`formats: ["query"]` + `queryOptions.prompt` "Trích nguyên văn Điều …") | Đừng dùng `firecrawl_search` với nội dung đầy đủ cho văn bản luật: một bộ luật trả về hàng trăm nghìn ký tự, tràn ngữ cảnh |
| Điều ước, CISG, WTO | Parallel `web_search` với `site:uncitral.un.org`, `site:docs.wto.org`, `site:wto.org` | vbpl.vn không phủ tầng quốc tế |
| Người dùng đính kèm file | Đọc file trước mọi công cụ web | Bậc nguồn cao nhất theo `quy-trinh-xac-minh.md` |
| Lấy nhanh nguyên văn một điều của luật thuộc chương trình HLU | Kho Luyện Luật (mục riêng bên dưới) | Bản chữ đã rà hiệu lực, có nhật ký nguồn; mức B, không thay bước đối chiếu vbpl.vn khi cần mức A |

## Mẫu gọi

Tình trạng hiệu lực của nhiều văn bản trong một lần:

```
web_search(
  objective="Tình trạng hiệu lực và ngày có hiệu lực trên vbpl.vn của các văn bản sau",
  search_queries=["\"91/2015/QH13\" site:vbpl.vn", "\"36/2005/QH11\" site:vbpl.vn", "\"13/2023/NĐ-CP\" site:vbpl.vn"])
```

Nguyên văn một khoản:

```
web_fetch(
  urls=["https://vbpl.vn/van-ban/chi-tiet/<slug>--<ItemID>"],
  objective="Nguyên văn Điều 301 (mức phạt vi phạm), đủ phần 'trừ trường hợp'; ghi chú sửa đổi nếu có")
```

## Legal Data Hunter — định vị nhanh, không thay được bước kiểm hiệu lực

Connector cơ sở dữ liệu pháp luật đa quốc gia; gói miễn phí 20 lượt tìm/ngày — hết lượt thì công cụ trả `limit_reached` kèm giờ đặt lại; khi đó chuyển sang Parallel, đừng gọi lại. Phủ Việt Nam qua ba nguồn: `VN/PhapLuatGov` (Cổng pháp luật quốc gia, ~34,7 nghìn văn bản, link về vbpl.vn), `VN/CongBao` (~22,7 nghìn, 2010–2026, toàn văn) và `VN/ThuVienPhapLuat` (~205,6 nghìn — nguồn tư nhân, chỉ để định vị). Phần án lệ/bản án Việt Nam gần như trống (3 bản án 2004–2006) → không dùng cho án.

Mẫu gọi đúng:

```
search(query="mức phạt vi phạm không quá 8% giá trị phần nghĩa vụ bị vi phạm",
       namespace="legislation", country=["VN"], source=["VN/PhapLuatGov", "VN/CongBao"], top_k=5)
```

Ba bẫy đã gặp khi thử nghiệm:

1. **Luật cũ xếp trên luật hiện hành.** Truy vấn trên trả về Điều 228 Luật Thương mại **1997** (đã hết hiệu lực) ở hai vị trí đầu, Điều 301 LTM 2005 ở vị trí thứ ba. Kết quả không có trường tình trạng hiệu lực. Luôn đọc trường `date` và tên văn bản trước khi dùng.
2. **Nguyên văn là bản ban hành gốc**, không chắc đã cập nhật các lần sửa đổi. Với điều đã sửa nhiều lần, đối chiếu văn bản hợp nhất trên vbpl.vn.
3. **`resolve_reference` không hiểu trích dẫn kiểu Việt Nam** ("Điều 117 Bộ luật Dân sự 2015" → not_found). Dùng `search` có lọc `country` và `source` thay vì `resolve_reference`.

Vì vậy kết quả Legal Data Hunter là bước **định vị** (tìm ra số điều và nguyên văn ứng viên), sau đó vẫn chạy kiểm tra hiệu lực bằng Parallel `web_search` trên vbpl.vn rồi mới nâng lên mức A.

Tầng quốc tế: `INTL/WTO-Disputes` có bản tóm tắt từng vụ kiện kèm link wto.org (không có toàn văn báo cáo Panel/Cơ quan Phúc thẩm — lấy ở docs.wto.org). Tìm theo ngữ nghĩa có thể trượt (tìm "Canada Autos" không ra DS139), nhưng lấy trực tiếp theo mã thì được: `get_document(source="INTL/WTO-Disputes", source_id="WT-DS139")`.

## Đọc URL vbpl.vn

- Mẫu mới: `https://vbpl.vn/van-ban/chi-tiet/<slug-không-dấu>--<ItemID>`; slug chứa loại văn bản, số hiệu và trích yếu (vd. `bo-luat-hinh-su-so-100-2015-qh13--96122`). Trang có các thẻ Nội dung, Thuộc tính, Lược đồ, Lịch sử, Văn bản gốc — **Lịch sử** và **Lược đồ** là nơi thấy văn bản sửa đổi và văn bản hướng dẫn.
- Mẫu cũ vẫn xuất hiện trong kết quả tìm kiếm: `vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=…` (toàn văn), `vbpq-thuoctinh.aspx` (thuộc tính, hiệu lực), `vbpq-luocdo.aspx` (lược đồ); tên miền cũ `vbpl.moj.gov.vn`.
- **Văn bản hợp nhất** (ký hiệu VBHN) gom văn bản gốc và các lần sửa đổi vào một bản đọc liền mạch — tiện để đọc quy định hiện hành của một điều đã sửa nhiều lần. Khi ghi CCPL trong bài, vẫn ghi theo văn bản gốc và văn bản sửa đổi theo quy cách ở SKILL.md, trừ khi giảng viên yêu cầu khác.

## Nguồn không đọc được — dữ kiện, không phải trở ngại để đi vòng

- **thuvienphapluat.vn, luatvietnam.vn**: có lớp chống bot (Cloudflare challenge) với truy cập tự động. Không giả trình duyệt hay tìm cách vượt — môi trường Claude cũng chặn các thao tác đó. Nếu connector đọc được thì dùng như nguồn định vị nhanh; nếu không thì bỏ qua, vì chúng đứng sau vbpl.vn trong thứ tự nguồn.
- **congbobanan.toaan.gov.vn, anle.toaan.gov.vn**: không kết nối được từ cloud session (có thể chặn IP nước ngoài). Với án lệ, nội dung án lệ thường được trích trong các nguồn khác; nhưng khi số và nội dung án lệ quyết định kết luận, chuyển việc tra cho người học theo mục "Khi không có công cụ tra cứu" của `quy-trinh-xac-minh.md`.
- Tra vbpl.vn bằng script tự viết: website giới hạn tần suất (thử nghiệm bị 403 sau khoảng 5 request liên tiếp) và chặn User-Agent chung chung. Với tra cứu trong bài làm, luôn đi qua Parallel/Firecrawl thay vì script.

## Ghi vết

Khi một căn cứ được nâng lên mức A nhờ tra cứu, ghi nguồn và ngày theo đúng quy cách ở SKILL.md, ví dụ "đối chiếu vbpl.vn ngày 30/10/2026". Ghi vết này là thứ cho phép tài liệu ôn thi của người dùng tích luỹ nhật ký xác minh qua thời gian.

## Kho văn bản của web Luyện Luật — bản chữ đã rà hiệu lực, mức B

Repo công khai `tranquanghaofake-dotcom/Law` (web https://tranquanghaofake-dotcom.github.io/Law/) giữ toàn văn khoảng 48 văn bản dùng trong chương trình HLU tại `packages/content/data/laws/*.txt`, kèm nhật ký nguồn `packages/content/data/SOURCES.md`: số hiệu, chuỗi luật sửa đổi kèm ngày hiệu lực, link, ngày đối chiếu; lần rà hiệu lực toàn kho gần nhất ngày 02/11/2026. Dòng đầu mỗi file ghi văn bản gốc, các luật sửa đổi và văn bản hợp nhất dùng làm bản chữ.

- Đọc trong Claude Code khi repo có trong phiên: `grep -n -A8 "^Điều 301\." packages/content/data/laws/ltm-vbhn-2025.txt`. Ngoài repo: `web_fetch` (hoặc `firecrawl_scrape`) trên `https://raw.githubusercontent.com/tranquanghaofake-dotcom/Law/main/packages/content/data/laws/<file>.txt`, `objective` nêu Điều cần lấy; tên file tra trong `SOURCES.md` cùng thư mục. Kênh này không phụ thuộc hạn mức Parallel.
- **Nhãn tin cậy**: phần lớn bản chữ lấy từ thuvienphapluat.vn, đã bỏ số chú thích của văn bản hợp nhất, và `SOURCES.md` tự ghi "chưa đối chiếu vbpl.vn" ở nhiều dòng → coi như tài liệu ôn thi có nhật ký xác minh (mục tương ứng ở SKILL.md): **mức B**, đủ để chốt số Điều, khoản và câu chữ; chỉ lên mức A sau khi đối chiếu vbpl.vn hoặc cổng nhà nước trong phiên.
- Vì đã bỏ chú thích, kho này **không cho biết điều nào bị luật nào sửa**; muốn ghi "được sửa đổi bởi khoản Y Điều Z Luật B" thì mở văn bản hợp nhất gốc hoặc chính luật sửa đổi.
- Luật sửa đổi chưa đến ngày hiệu lực được ghi riêng trong `SOURCES.md` (mục "Sổ văn bản sửa đổi" của `he-thong-van-ban-va-ap-dung.md` chép lại các mốc này) — đọc trước khi khẳng định câu chữ "hiện hành".
- So với dataset Hugging Face ở mục dưới: kho Luyện Luật hẹp hơn nhiều nhưng mới hơn (rà theo Công báo đến văn bản hợp nhất số 172/2026) và có nguyên văn đã cập nhật sửa đổi; dataset rộng hơn, dùng để định vị văn bản ngoài kho.
- Mâu thuẫn giữa kho này và vbpl.vn → vbpl.vn thắng; báo người dùng để sửa `SOURCES.md`.

## Khi công cụ web hết hạn mức — định vị ngoại tuyến bằng dữ liệu mở

Parallel Search có thể hết hạn mức miễn phí sau vài lượt gọi trong một phiên (đã gặp ngày 04/11/2026). Khi đó: Firecrawl `firecrawl_search` để lấy trang thuộc tính trên vanban.chinhphu.vn hoặc vbpq.toaan.gov.vn (cổng nhà nước, đủ để xác nhận số hiệu và ngày hiệu lực), và `firecrawl_scrape` với `parsers: ["pdf"]` trên file PDF đính kèm của vanban.chinhphu.vn để đọc nội dung luật sửa đổi.

Dataset mở trên Hugging Face `th1nhng0/vietnamese-legal-documents` (crawl từ vbpl.vn, CC BY 4.0, ~171 nghìn văn bản, có trường tình trạng hiệu lực, ngày hiệu lực, và bảng quan hệ sửa đổi/thay thế) dùng được qua công cụ Hugging Face để **định vị** văn bản và phát hiện văn bản đã bị thay thế. Đây là ảnh chụp tại một thời điểm, có độ trễ — không bao giờ dùng để nâng căn cứ lên mức A.
