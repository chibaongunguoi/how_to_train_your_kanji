import React from "react";

function Guide() {
  const containerStyle = {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    marginTop: "20px",
    marginBottom: "20px",
  };

  const sectionStyle = {
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  };

  const titleStyle = {
    color: "#495057",
    marginBottom: "15px",
    borderBottom: "3px solid #007bff",
    paddingBottom: "10px",
  };

  const subtitleStyle = {
    color: "#6c757d",
    marginBottom: "10px",
    marginTop: "20px",
  };

  const codeStyle = {
    backgroundColor: "#e9ecef",
    padding: "15px",
    borderRadius: "5px",
    fontFamily: "monospace",
    fontSize: "14px",
    border: "1px solid #ced4da",
    overflow: "auto",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    backgroundColor: "white",
  };

  const thStyle = {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "left",
    border: "1px solid #dee2e6",
  };

  const tdStyle = {
    padding: "12px",
    border: "1px solid #dee2e6",
    verticalAlign: "top",
  };

  const highlightStyle = {
    backgroundColor: "#fff3cd",
    padding: "15px",
    borderRadius: "5px",
    border: "1px solid #ffeaa7",
    marginTop: "15px",
  };

  return (
    <div style={containerStyle}>
      <h1
        style={{ textAlign: "center", color: "#495057", marginBottom: "30px" }}
      >
        📖 Hướng dẫn sử dụng How to Train Your Kanji
      </h1>

      {/* Video hướng dẫn YouTube */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>🎥 Video hướng dẫn chi tiết</h2>
        <div
          style={{
            position: "relative",
            paddingBottom: "56.25%", // 16:9 aspect ratio
            height: 0,
            overflow: "hidden",
            marginBottom: "15px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/C4h2jRilSJw"
            title="Hướng dẫn sử dụng How to Train Your Kanji"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "8px",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p style={{ textAlign: "center", color: "#6c757d", fontSize: "14px", fontStyle: "italic" }}>
          🎬 Video hướng dẫn chi tiết cách sử dụng tất cả tính năng của ứng dụng
        </p>
      </div>

      {/* Định dạng file Excel */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>📊 Định dạng file Excel</h2>
        <p>File Excel cần có định dạng như sau để hệ thống có thể đọc được:</p>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Cột</th>
              <th style={thStyle}>Tên cột</th>
              <th style={thStyle}>Mô tả</th>
              <th style={thStyle}>Ví dụ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>A</td>
              <td style={tdStyle}>
                <strong>Kanji</strong>
              </td>
              <td style={tdStyle}>Chữ kanji</td>
              <td style={tdStyle}>人</td>
            </tr>
            <tr>
              <td style={tdStyle}>B</td>
              <td style={tdStyle}>
                <strong>Hán Việt</strong>
              </td>
              <td style={tdStyle}>
                Âm Hán Việt (có thể có nhiều âm, cách nhau bằng dấu phẩy)
              </td>
              <td style={tdStyle}>nhân, người</td>
            </tr>
            <tr>
              <td style={tdStyle}>C</td>
              <td style={tdStyle}>
                <strong>Âm Kun</strong>
              </td>
              <td style={tdStyle}>Âm đọc Kun (hiragana, có thể có nhiều âm)</td>
              <td style={tdStyle}>ひと</td>
            </tr>
            <tr>
              <td style={tdStyle}>D</td>
              <td style={tdStyle}>
                <strong>Âm On</strong>
              </td>
              <td style={tdStyle}>
                Âm đọc On (katakana/hiragana, có thể có nhiều âm)
              </td>
              <td style={tdStyle}>ジン、ニン</td>
            </tr>
            <tr>
              <td style={tdStyle}>E, F</td>
              <td style={tdStyle}>
                <strong> Ví dụ </strong>
              </td>
              <td style={tdStyle}>Từ ví dụ sử dụng kanji này</td>
              <td style={tdStyle}>人間</td>
            </tr>
          </tbody>
        </table>

        <div style={highlightStyle}>
          <h4 style={{ color: "#856404", marginTop: 0 }}>
            💡 Lưu ý quan trọng:
          </h4>
          <ul style={{ color: "#856404", marginBottom: 0 }}>
            <li>Dòng đầu tiên phải là tiêu đề cột</li>
            <li>Có thể có nhiều ví dụ (Ví dụ 2, Phonetic 2, v.v.)</li>
            <li>Nếu không có âm Kun hoặc On, để trống cột đó</li>
            <li>Có thể có nhiều kanji trong một file</li>
            <li>Hệ thống hỗ trợ format .xlsx và .xls</li>
          </ul>
        </div>

        {/* Ảnh minh họa định dạng Excel */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            padding: "15px",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4 style={{ color: "#495057", marginBottom: "15px" }}>
            📸 Ảnh từ file excel mặc định KANJI_N3.xlsx
          </h4>
          <img
            src="/format_excel.png"
            alt="Định dạng file Excel mẫu"
            style={{
              maxWidth: "100%",
              height: "auto",
              border: "2px solid #007bff",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          />
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#6c757d",
              fontStyle: "italic",
            }}
          >
            Ví dụ về cách sắp xếp dữ liệu trong file Excel
          </p>
        </div>
      </div>

      {/* Chế độ import */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>🔧 Chế độ import dữ liệu</h2>

        <h3 style={subtitleStyle}>🔄 Kết hợp dữ liệu (Merge)</h3>
        <p>
          Chế độ này sẽ giữ lại tất cả dữ liệu cũ và thêm/cập nhật dữ liệu mới:
        </p>
        <ul>
          <li>
            <strong>Kanji mới:</strong> Các kanji chưa có trong hệ thống sẽ được
            thêm vào
          </li>
          <li>
            <strong>Kanji cập nhật:</strong> Các kanji đã có nhưng có thông tin
            khác sẽ được cập nhật
          </li>
          <li>
            <strong>Kanji không đổi:</strong> Các kanji có thông tin giống hệt
            sẽ giữ nguyên
          </li>
        </ul>

        <h3 style={subtitleStyle}>🗑️ Thay thế hoàn toàn (Replace)</h3>
        <p>
          Chế độ này sẽ xóa toàn bộ dữ liệu cũ và chỉ giữ lại dữ liệu từ file
          mới upload.
        </p>
      </div>

      {/* Hướng dẫn từng chức năng */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>🎯 Hướng dẫn các chức năng</h2>

        <h3 style={subtitleStyle}>🏠 Trang chủ</h3>
        <p>
          Trang chủ là nơi bạn có thể upload file Excel chứa dữ liệu kanji. Sau
          khi upload thành công, bạn sẽ thấy thông báo số lượng kanji đã được
          tải vào hệ thống.
        </p>

        <h3 style={subtitleStyle}>📚 Danh sách Kanji</h3>
        <p>Trang này cho phép bạn:</p>
        <ul>
          <li>
            <strong>Xem tất cả kanji:</strong> Hiển thị danh sách đầy đủ các
            kanji đã tải
          </li>
          <li>
            <strong>Tìm kiếm:</strong> Tìm kiếm theo kanji, Hán Việt, âm Kun, âm
            On, hoặc ví dụ
          </li>
          <li>
            <strong>Sắp xếp:</strong> Sắp xếp theo alphabet hoặc thứ tự import
          </li>
          <li>
            <strong>Xóa kanji:</strong> Xóa những kanji không cần thiết
          </li>
        </ul>

        <h3 style={subtitleStyle}>🎯 Kiểm tra Kanji</h3>
        <p>Chức năng này giúp bạn kiểm tra kiến thức một cách ngẫu nhiên:</p>
        <ul>
          <li>
            <strong>Lọc theo loại:</strong> Chọn kiểm tra kanji mới, đã học,
            hoặc tất cả
          </li>
          <li>
            <strong>Chế độ romaji:</strong> Nhập âm đọc bằng chữ Latin thay vì
            hiragana
          </li>
          <li>
            <strong>Bỏ qua trường:</strong> Không cần trả lời những trường không
            biết
          </li>
          <li>
            <strong>Hiển thị đáp án:</strong> Xem đáp án đúng sau khi trả lời
          </li>
        </ul>

        <h3 style={subtitleStyle}>📅 Học theo ngày</h3>
        <p>Tính năng này giúp bạn học kanji một cách có kế hoạch:</p>
        <ul>
          <li>
            <strong>Thiết lập kế hoạch:</strong> Chọn số từ học mỗi ngày
          </li>
          <li>
            <strong>Chế độ học:</strong> Xem trước thông tin các kanji trong
            ngày
          </li>
          <li>
            <strong>Chế độ kiểm tra:</strong> Làm bài kiểm tra từng kanji
          </li>
          <li>
            <strong>Theo dõi tiến độ:</strong> Xem tiến độ học tập theo từng
            ngày
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Guide;
