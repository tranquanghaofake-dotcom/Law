# Dùng skill này trong chat có connector Microsoft 365

Đọc khi người dùng nói đã kết nối Microsoft 365 / OneDrive / PowerPoint, hoặc muốn lấy tài liệu nguồn từ OneDrive. Mục "Đã kiểm" ghi đúng điều đã xác nhận ngày 12/11/2026 từ thông số công cụ; mục "Chưa kiểm" là điều chưa chạy thử — lần đầu dùng phải chạy thử nhỏ trước.

## 1. Connector làm được gì (đã kiểm từ thông số công cụ)

- Tên connector `Microsoft 365`; trong phiên kiểm là **tài khoản Microsoft cá nhân** (OneDrive cá nhân, không phải SharePoint của tổ chức). Quyền đã cấp (`get_granted_scopes`): `Files.Read.All`, `Files.ReadWrite.All`, `Mail.Read/ReadWrite/Send`, `Calendars.Read/ReadWrite`, `People.Read`, `User.Read`.
- Công cụ file: `sharepoint_search` (tìm theo tên và nội dung), `sharepoint_folder_search`, `sharepoint_create_folder`, `sharepoint_upload_file`, `sharepoint_update_file`, `sharepoint_copy_item` / `move_item` / `rename_item` / `delete_item`, `read_resource`.
- **Giới hạn cứng:** `sharepoint_upload_file` và `sharepoint_update_file` nhận tối đa **1.048.576 byte**; file nhị phân (`.pptx`) phải truyền bằng `contentBase64` (một chuỗi liền, không chia đoạn); văn bản truyền bằng `content`. Mặc định `conflictBehavior` là `fail`; `replace` ghi đè (phá huỷ) — **không dùng khi chưa hỏi người dùng**.
- `read_resource` đọc `file:///{driveId}/{itemId}`: `.docx` / `.pptx` / `.pdf` được đọc qua chuyển PDF của Microsoft Graph → ra **văn bản theo trang**, không có hình, hiệu ứng, Morph; `.txt` `.json` `.md` đọc trực tiếp, chia trang theo dòng.

## 2. Làm được / không làm được

| Việc | Kết luận |
|---|---|
| Lấy tài liệu nguồn (docx, pdf, pptx cũ, xlsx) trong OneDrive làm đầu vào Bước 1 | **Làm được.** `sharepoint_search` → `read_resource` → ghi văn bản ra file `.md` trong thư mục deck → `scripts/outline.py` |
| Lưu và nạp lại `deck.json`, `prep.json`, `notes.md`, `prep.md` (văn bản) | **Làm được**, dưới 1 MiB, dùng tham số `content`. Đây là cách giữ nguồn sự thật giữa các chat: chat khác nạp `deck.json` rồi dựng lại PPTX |
| Đọc lại bản PPTX người dùng đã sửa trong PowerPoint, để đối chiếu chữ | **Làm được** (chỉ chữ, theo trang) |
| Giao file `.pptx` lên OneDrive bằng connector | **Không thực tế.** 0,5 MB nhị phân thành khoảng 0,7 triệu ký tự base64 phải đi qua tham số công cụ. Giao file bằng cách gửi cho người dùng tải về (đính kèm của chat), họ tự kéo vào OneDrive |
| Kiểm Morph, hiệu ứng, font nhúng trong PowerPoint thật | **Không làm được.** Không có công cụ mở PowerPoint hay chụp slide. Người dùng mở bằng PowerPoint 2019 / Microsoft 365, bấm Enable Editing, rồi báo lại ba điều ở `SKILL.md` ("Nói với người dùng khi giao file tầng hình ảnh") |
| Tạo hoặc sửa slide trực tiếp trong PowerPoint | **Không làm được** qua connector này |

## 3. Quy trình khuyên dùng

1. Hỏi người dùng thư mục nguồn; `sharepoint_folder_search` / `sharepoint_search` để tìm tài liệu. Đọc bằng `read_resource`; tài liệu dài thì đọc theo `startPage` / `endPage`.
2. Làm Bước 0 như bình thường (`prep.json`, người dùng duyệt). **Không** ghi gì lên OneDrive khi chưa được yêu cầu.
3. Dựng PPTX trong chat. Trước khi giao: `node hinh/dung.js deck.json --soat` (tầng hình ảnh) hoặc `engine/build.js --strict` + `scripts/check_overflow.py` (tầng lưới Office); và `python3 scripts/nhin_mo.py <file.pptx>` để kiểm "che chữ vẫn đoán được".
4. Gửi file `.pptx` cho người dùng tải về. Nếu họ muốn lưu `deck.json` / `prep.json` trên OneDrive: hỏi thư mục, `sharepoint_create_folder`, `sharepoint_upload_file` với `conflictBehavior: "rename"`; báo lại `webUrl`.
5. Người dùng sửa trong PowerPoint rồi cần đối chiếu: `read_resource` bản `.pptx` đã sửa, so chữ với `deck.json`, sửa `deck.json` rồi dựng lại (đừng vá file `.pptx`).

Thư mục gợi ý: `Luyện Luật/Slides/<tên-deck>/` chứa `deck.json`, `prep.json`, `notes.md`.

## 4. Chưa kiểm — chạy thử nhỏ trước

- Chưa tải lên thật (chỉ đọc thông số công cụ). Lần đầu: `get_granted_scopes` → `sharepoint_folder_search` tên "Luyện Luật" → nếu người dùng đồng ý, tạo thư mục và tải lên một file văn bản nhỏ, đọc lại bằng `read_resource`.
- Chưa biết bản chuyển PDF của Microsoft có đọc được `.pptx` có font nhúng và có giữ thứ tự chữ đúng không.
- Tài khoản tổ chức (Microsoft 365 công ty / trường) có thể có công cụ và giới hạn khác tài khoản cá nhân; đọc lại mô tả công cụ trong chat đó.
