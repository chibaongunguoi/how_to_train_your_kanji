import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";

function KanjiList({ kanjiData, onDeleteKanji }) {
  const [sortBy, setSortBy] = useState(null); // 'hanviet', 'kun', 'on', or null
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyFirstTwoExamples, setShowOnlyFirstTwoExamples] =
    useState(false);
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa trong input
  const [activeSearchKeyword, setActiveSearchKeyword] = useState(""); // Từ khóa thực tế để tìm kiếm
  const [showMarkedOnly, setShowMarkedOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showUpdatedOnly, setShowUpdatedOnly] = useState(false);
  const [showExistingOnly, setShowExistingOnly] = useState(false);
  const [markedWords, setMarkedWords] = useState(() => {
    const saved = localStorage.getItem("markedWords");
    return saved ? JSON.parse(saved) : [];
  });
  const itemsPerPage = 100;

  // Hàm xử lý sắp xếp
  const handleSort = (column) => {
    if (sortBy === column) {
      // Nếu đang sắp xếp theo cột hiện tại, đổi thứ tự
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Nếu sắp xếp theo cột mới, mặc định là tăng dần
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Hàm xử lý xóa kanji
  const handleDeleteKanji = (kanjiToDelete) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa chữ kanji "${kanjiToDelete.kanji}"?\n\n` +
        `Hán Việt: ${
          Array.isArray(kanjiToDelete.hanviet)
            ? kanjiToDelete.hanviet.join(", ")
            : kanjiToDelete.hanviet
        }\n` +
        `Âm Kun: ${
          Array.isArray(kanjiToDelete.kun)
            ? kanjiToDelete.kun.join(", ")
            : kanjiToDelete.kun
        }\n` +
        `Âm On: ${
          Array.isArray(kanjiToDelete.on)
            ? kanjiToDelete.on.join(", ")
            : kanjiToDelete.on
        }`
    );

    if (confirmDelete && onDeleteKanji) {
      onDeleteKanji(kanjiToDelete.kanji);
    }
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = () => {
    setActiveSearchKeyword(searchKeyword);
  };

  // Hàm xóa tìm kiếm
  const handleClearSearch = () => {
    setSearchKeyword("");
    setActiveSearchKeyword("");
  };

  // Hàm toggle đánh dấu kanji
  const handleToggleMark = (kanjiChar) => {
    setMarkedWords((prev) => {
      const newMarkedWords = prev.includes(kanjiChar)
        ? prev.filter((k) => k !== kanjiChar)
        : [...prev, kanjiChar];
      localStorage.setItem("markedWords", JSON.stringify(newMarkedWords));
      return newMarkedWords;
    });
  };

  // Hàm xóa tất cả đánh dấu
  const handleClearAllMarks = () => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa tất cả các từ đã đánh dấu?")
    ) {
      setMarkedWords([]);
      localStorage.setItem("markedWords", JSON.stringify([]));
    }
  };

  // Hàm chuẩn hóa tiếng Việt (bỏ dấu) để sắp xếp
  const normalizeVietnamese = (str) => {
    return str
      .normalize("NFD") // Tách các ký tự có dấu thành ký tự gốc + dấu
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  // Hàm lấy giá trị để sắp xếp
  const getSortValue = (item, column) => {
    const value = item[column];
    if (!value) return "";

    let sortValue;
    if (Array.isArray(value)) {
      // Nếu là mảng, lấy phần tử đầu tiên để sắp xếp
      sortValue = value.length > 0 ? value[0] : "";
    } else {
      sortValue = value;
    }

    // Nếu sắp xếp theo Hán Việt, chuẩn hóa tiếng Việt
    if (column === "hanviet") {
      return normalizeVietnamese(sortValue);
    }

    return sortValue.toLowerCase();
  };

  // Hàm tìm kiếm qua tất cả trường
  const searchInAllFields = (item, keyword) => {
    if (!keyword) return true;

    const searchTerm = normalizeVietnamese(keyword.toLowerCase());

    // Tìm trong kanji
    if (item.kanji && item.kanji.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Tìm trong hanviet
    if (item.hanviet) {
      const hanvietText = Array.isArray(item.hanviet)
        ? item.hanviet.join(" ")
        : item.hanviet;
      if (normalizeVietnamese(hanvietText.toLowerCase()).includes(searchTerm)) {
        return true;
      }
    }

    // Tìm trong kun
    if (item.kun) {
      const kunText = Array.isArray(item.kun) ? item.kun.join(" ") : item.kun;
      if (kunText.toLowerCase().includes(searchTerm)) {
        return true;
      }
    }

    // Tìm trong on
    if (item.on) {
      const onText = Array.isArray(item.on) ? item.on.join(" ") : item.on;
      if (onText.toLowerCase().includes(searchTerm)) {
        return true;
      }
    }

    // Tìm trong example
    if (item.example && Array.isArray(item.example)) {
      for (const example of item.example) {
        if (example) {
          let exampleText = "";
          if (typeof example === "string") {
            exampleText = example;
          } else if (typeof example === "object" && example.text) {
            exampleText = example.text;
          }
          if (exampleText && exampleText.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Dữ liệu đã được lọc và sắp xếp
  const filteredAndSortedKanjiData = useMemo(() => {
    // Trước tiên lọc theo từ khóa tìm kiếm
    let filtered = kanjiData.filter((item) =>
      searchInAllFields(item, activeSearchKeyword)
    );

    // Lọc theo các điều kiện đã chọn (sử dụng logic OR - hiển thị thêm)
    const hasAnyFilter =
      showMarkedOnly || showNewOnly || showUpdatedOnly || showExistingOnly;

    if (hasAnyFilter) {
      filtered = filtered.filter((item) => {
        let shouldShow = false;

        // Kiểm tra nếu kanji đã được đánh dấu
        if (showMarkedOnly && markedWords.includes(item.kanji)) {
          shouldShow = true;
        }

        // Kiểm tra nếu kanji có status mới
        if (showNewOnly && item.status === "new") {
          shouldShow = true;
        }

        // Kiểm tra nếu kanji có status cập nhật
        if (showUpdatedOnly && item.status === "updated") {
          shouldShow = true;
        }

        // Kiểm tra nếu kanji có status existing
        if (showExistingOnly && (!item.status || item.status === "existing")) {
          shouldShow = true;
        }

        return shouldShow;
      });
    }

    // Sau đó sắp xếp nếu có
    if (!sortBy) return filtered;

    const sorted = [...filtered].sort((a, b) => {
      const valueA = getSortValue(a, sortBy);
      const valueB = getSortValue(b, sortBy);

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [
    kanjiData,
    sortBy,
    sortOrder,
    activeSearchKeyword,
    showMarkedOnly,
    showNewOnly,
    showUpdatedOnly,
    showExistingOnly,
    markedWords,
  ]);

  // Tính toán phân trang
  const totalPages = Math.ceil(
    filteredAndSortedKanjiData.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredAndSortedKanjiData.slice(
    startIndex,
    endIndex
  );

  // Reset về trang 1 khi thay đổi sắp xếp hoặc tìm kiếm
  useMemo(() => {
    setCurrentPage(1);
  }, [
    sortBy,
    sortOrder,
    activeSearchKeyword,
    showMarkedOnly,
    showNewOnly,
    showUpdatedOnly,
    showExistingOnly,
  ]);

  // Hàm chuyển trang
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Hàm tạo số trang hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 10;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 6) {
        for (let i = 1; i <= 8; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 5) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 7; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Hàm tạo biểu tượng trạng thái kanji
  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return { icon: "🆕", color: "#28a745", text: "Mới" };
      case "updated":
        return { icon: "🔄", color: "#ffc107", text: "Cập nhật" };
      case "existing":
        return { icon: "✅", color: "#6c757d", text: "Không đổi" };
      default:
        return { icon: "", color: "#6c757d", text: "" };
    }
  };

  // Hàm tạo biểu tượng sắp xếp
  const getSortIcon = (column) => {
    if (sortBy !== column) return " ↕️";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };
  // Hàm kiểm tra xem ký tự có phải kanji không
  const isKanji = (char) => {
    const code = char.charCodeAt(0);
    return (
      (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
      (code >= 0x20000 && code <= 0x2a6df)
    ); // CJK Extension B
  };

  // Hàm tạo ruby text cho kanji và phonetic
  const createRubyText = (text, phonetic) => {
    if (!phonetic) return text;

    const textChars = Array.from(text);
    const phoneticChars = Array.from(phonetic);
    const result = [];

    let phoneticIndex = 0;

    for (let i = 0; i < textChars.length; i++) {
      const char = textChars[i];

      if (isKanji(char)) {
        // Nếu là kanji, tạo ruby với phonetic tương ứng
        let rubyPhonetic = "";
        // Lấy phonetic cho kanji này (tạm thời lấy tất cả phonetic còn lại)
        if (phoneticIndex < phoneticChars.length) {
          // Tính toán số phonetic chars cho kanji này
          const remainingKanji = textChars.slice(i + 1).filter(isKanji).length;
          const remainingPhonetic = phoneticChars.slice(phoneticIndex);
          const phoneticPerKanji = Math.ceil(
            remainingPhonetic.length / (remainingKanji + 1)
          );

          rubyPhonetic = remainingPhonetic.slice(0, phoneticPerKanji).join("");
          phoneticIndex += phoneticPerKanji;
        }

        result.push(
          <ruby key={i}>
            {char}
            <rt style={{ fontSize: "10px", color: "#666" }}>{rubyPhonetic}</rt>
          </ruby>
        );
      } else {
        // Nếu không phải kanji (hiragana, katakana, etc.), hiển thị bình thường
        result.push(<span key={i}>{char}</span>);
      }
    }

    return result;
  };

  const renderExample = (example) => {
    if (!example) return "";
    if (typeof example === "string") return example;
    if (typeof example === "object" && example.text) {
      return (
        <div style={{ fontSize: "16px" }}>
          {example.phonetic
            ? createRubyText(example.text, example.phonetic)
            : example.text}
        </div>
      );
    }
    return "";
  };

  // Hàm xuất file Excel theo âm On
  const exportOnReadingsToExcel = () => {
    // Hàm chuẩn hóa Hán Việt: thay thế xuống dòng và /n thành /
    const normalizeHanviet = (hanviet) => {
      if (!hanviet) return "";
      
      let normalized = Array.isArray(hanviet)
        ? hanviet.join(", ")
        : hanviet.toString();
      
      // Thay thế các ký tự xuống dòng (\n, \r\n, \r) thành /
      normalized = normalized.replace(/\r?\n|\r/g, "/");
      
      // Thay thế /n thành /
      normalized = normalized.replace(/\/n/g, "/");
      
      // Loại bỏ các dấu / thừa (nhiều dấu / liên tiếp)
      normalized = normalized.replace(/\/+/g, "/");
      
      // Thêm khoảng trắng sau dấu / để dễ đọc
      normalized = normalized.replace(/\//g, "/ ");
      
      // Loại bỏ khoảng trắng thừa
      normalized = normalized.replace(/\s+/g, " ").trim();
      
      // Chuyển thành chữ thường
      normalized = normalized.toLowerCase();
      
      return normalized;
    };

    // Tạo object để nhóm kanji theo âm On
    const onReadingsMap = {};
    const kanjiWithoutOn = []; // Danh sách kanji không có âm On

    kanjiData.forEach((item) => {
      // Kiểm tra nếu không có âm On
      if (!item.on || (Array.isArray(item.on) && item.on.length === 0) || 
          (typeof item.on === 'string' && item.on.trim() === '')) {
        // Chuẩn hóa Hán Việt
        const hanviet = normalizeHanviet(item.hanviet);
        const kanjiEntry = `${hanviet} (${item.kanji})`;
        kanjiWithoutOn.push(kanjiEntry);
        return;
      }

      // Xử lý âm On (có thể là string hoặc array)
      const onReadings = Array.isArray(item.on) ? item.on : [item.on];

      onReadings.forEach((onReading) => {
        const cleanedReading = onReading.trim();
        if (!cleanedReading) return;

        // Chuẩn hóa Hán Việt
        const hanviet = normalizeHanviet(item.hanviet);

        // Tạo entry cho kanji này
        const kanjiEntry = `${hanviet} (${item.kanji})`;

        // Thêm vào map
        if (!onReadingsMap[cleanedReading]) {
          onReadingsMap[cleanedReading] = [];
        }
        onReadingsMap[cleanedReading].push(kanjiEntry);
      });
    });

    // Sắp xếp các âm On theo thứ tự alphabet
    const sortedOnReadings = Object.keys(onReadingsMap).sort();

    // Tạo dữ liệu cho Excel
    const excelData = sortedOnReadings.map((onReading) => {
      const kanjiList = onReadingsMap[onReading].join(", ");
      return {
        "Âm On": onReading,
        "Các chữ Hán": kanjiList,
      };
    });

    // Thêm dòng cuối với các kanji không có âm On
    if (kanjiWithoutOn.length > 0) {
      excelData.push({
        "Âm On": "",
        "Các chữ Hán": kanjiWithoutOn.join(", "),
      });
    }

    // Tạo worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    const columnWidths = [
      { wch: 15 }, // Cột A - Âm On
      { wch: 100 }, // Cột B - Các chữ Hán (tăng width)
    ];
    worksheet["!cols"] = columnWidths;

    // Áp dụng font cho từng cell
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        // Khởi tạo style nếu chưa có
        if (!worksheet[cellAddress].s) {
          worksheet[cellAddress].s = {};
        }

        // Cột A (Âm On) - Yu Mincho
        if (C === 0) {
          worksheet[cellAddress].s.font = {
            name: "Yu Mincho",
            sz: 11
          };
        }
        // Cột B (Các chữ Hán) - Cần xử lý mixed font
        else if (C === 1) {
          // Vì XLSX không hỗ trợ mixed font trong 1 cell,
          // ta sẽ set font mặc định là Times New Roman
          // và kanji sẽ tự động dùng fallback font hệ thống (Yu Mincho)
          worksheet[cellAddress].s.font = {
            name: "Times New Roman, Yu Mincho",
            sz: 11
          };
        }
      }
    }

    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Âm On");

    // Xuất file
    const fileName = `Danh_sach_am_On_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Danh sách các chữ có trong hệ thống</h2>

      {/* Khu vực điều khiển sắp xếp và thống kê */}
      {kanjiData.length > 0 && (
        <>
          {/* Thống kê trạng thái kanji */}
          <div
            style={{
              marginBottom: "10px",
              padding: "10px",
              backgroundColor: "#e9f7ef",
              borderRadius: "5px",
              border: "1px solid #c3e6cb",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <strong>📊 Thống kê:</strong>
                <button
                  onClick={() => setShowNewOnly(!showNewOnly)}
                  style={{
                    color: showNewOnly ? "white" : "#28a745",
                    backgroundColor: showNewOnly ? "#28a745" : "transparent",
                    border: showNewOnly
                      ? "1px solid #28a745"
                      : "1px solid #28a745",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: showNewOnly ? "bold" : "normal",
                    transition: "all 0.3s ease",
                  }}
                  title={
                    showNewOnly
                      ? "Hiển thị tất cả kanji"
                      : "Chỉ hiển thị kanji mới"
                  }
                >
                  🆕 Mới: {kanjiData.filter((k) => k.status === "new").length}
                  {showNewOnly && " (đang lọc)"}
                </button>
                <button
                  onClick={() => setShowUpdatedOnly(!showUpdatedOnly)}
                  style={{
                    color: showUpdatedOnly ? "#212529" : "#ffc107",
                    backgroundColor: showUpdatedOnly ? "#ffc107" : "transparent",
                    border: showUpdatedOnly
                      ? "1px solid #ffc107"
                      : "1px solid #ffc107",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: showUpdatedOnly ? "bold" : "normal",
                    transition: "all 0.3s ease",
                  }}
                  title={
                    showUpdatedOnly
                      ? "Hiển thị tất cả kanji"
                      : "Chỉ hiển thị kanji cập nhật"
                  }
                >
                  🔄 Cập nhật:{" "}
                  {kanjiData.filter((k) => k.status === "updated").length}
                  {showUpdatedOnly && " (đang lọc)"}
                </button>
                <button
                  onClick={() => setShowExistingOnly(!showExistingOnly)}
                  style={{
                    color: showExistingOnly ? "white" : "#6c757d",
                    backgroundColor: showExistingOnly ? "#6c757d" : "transparent",
                    border: showExistingOnly
                      ? "1px solid #6c757d"
                      : "1px solid #6c757d",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: showExistingOnly ? "bold" : "normal",
                    transition: "all 0.3s ease",
                  }}
                  title={
                    showExistingOnly
                      ? "Hiển thị tất cả kanji"
                      : "Chỉ hiển thị kanji không đổi"
                  }
                >
                  ✅ Không đổi:{" "}
                  {
                    kanjiData.filter((k) => !k.status || k.status === "existing")
                      .length
                  }
                  {showExistingOnly && " (đang lọc)"}
                </button>
                <span style={{ color: "#17a2b8" }}>
                  📝 {activeSearchKeyword ? "Hiển thị" : "Tổng"}:{" "}
                  {filteredAndSortedKanjiData.length}
                  {activeSearchKeyword && ` / ${kanjiData.length}`}
                </span>
                <button
                  onClick={() => setShowMarkedOnly(!showMarkedOnly)}
                  style={{
                    color: showMarkedOnly ? "white" : "#e83e8c",
                    backgroundColor: showMarkedOnly ? "#e83e8c" : "transparent",
                    border: showMarkedOnly
                      ? "1px solid #e83e8c"
                      : "1px solid #e83e8c",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: showMarkedOnly ? "bold" : "normal",
                    transition: "all 0.3s ease",
                  }}
                  title={
                    showMarkedOnly
                      ? "Hiển thị tất cả kanji"
                      : "Chỉ hiển thị kanji đã đánh dấu"
                  }
                >
                  ⭐ Đã đánh dấu: {markedWords.length}
                  {showMarkedOnly && " (đang lọc)"}
                </button>
              </div>

              {/* Nút xuất Excel */}
              <button
                onClick={exportOnReadingsToExcel}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#138496";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#17a2b8";
                  e.target.style.transform = "scale(1)";
                }}
                title="Xuất danh sách âm On và các chữ Hán tương ứng ra file Excel"
              >
                📥 Xuất danh sách Âm On
              </button>
            </div>
          </div>

          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                flex: "1",
              }}
            >
              <span style={{ fontWeight: "bold" }}>Sắp xếp:</span>
              <button
                onClick={() => handleSort("hanviet")}
                style={{
                  padding: "5px 10px",
                  backgroundColor: sortBy === "hanviet" ? "#2196F3" : "#e0e0e0",
                  color: sortBy === "hanviet" ? "white" : "black",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Hán Việt {sortBy === "hanviet" ? getSortIcon("hanviet") : ""}
              </button>
              <button
                onClick={() => handleSort("kun")}
                style={{
                  padding: "5px 10px",
                  backgroundColor: sortBy === "kun" ? "#2196F3" : "#e0e0e0",
                  color: sortBy === "kun" ? "white" : "black",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Âm Kun {sortBy === "kun" ? getSortIcon("kun") : ""}
              </button>
              <button
                onClick={() => handleSort("on")}
                style={{
                  padding: "5px 10px",
                  backgroundColor: sortBy === "on" ? "#2196F3" : "#e0e0e0",
                  color: sortBy === "on" ? "white" : "black",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Âm On {sortBy === "on" ? getSortIcon("on") : ""}
              </button>
              {sortBy && (
                <button
                  onClick={() => {
                    setSortBy(null);
                    setSortOrder("asc");
                  }}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Xóa sắp xếp
                </button>
              )}
              {sortBy && (
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Đang sắp xếp theo{" "}
                  <strong>
                    {sortBy === "hanviet"
                      ? "Hán Việt"
                      : sortBy === "kun"
                      ? "Âm Kun"
                      : "Âm On"}
                  </strong>{" "}
                  ({sortOrder === "asc" ? "A-Z" : "Z-A"})
                </span>
              )}
            </div>

            {/* Thanh tìm kiếm */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: "350px",
              }}
            >
              <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                🔍 Tìm kiếm:
              </span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm..."
                style={{
                  padding: "6px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                  flex: "1",
                  outline: "none",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2196F3")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                }}
                title="Thực hiện tìm kiếm"
              >
                Tìm
              </button>
              {activeSearchKeyword && (
                <button
                  onClick={handleClearSearch}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                  title="Xóa tìm kiếm"
                >
                  ✕ Xóa
                </button>
              )}
            </div>
          </div>

          {/* Checkbox hiển thị ví dụ */}
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px",
              border: "1px solid #dee2e6",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <input
                type="checkbox"
                checked={showOnlyFirstTwoExamples}
                onChange={(e) => setShowOnlyFirstTwoExamples(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              📝 Chỉ hiển thị 2 từ ví dụ đầu tiên (ẩn các ví dụ bổ sung)
            </label>
          </div>
        </>
      )}

      {/* Thông tin phân trang */}
      {kanjiData.length > 0 && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            borderRadius: "5px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Tổng cộng:</strong> {filteredAndSortedKanjiData.length}{" "}
            kanji | <strong>Trang:</strong> {currentPage}/{totalPages} |{" "}
            <strong>Hiển thị:</strong> {startIndex + 1}-
            {Math.min(endIndex, filteredAndSortedKanjiData.length)}
          </div>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "5px 10px",
                backgroundColor: currentPage === 1 ? "#e0e0e0" : "#007bff",
                color: currentPage === 1 ? "#666" : "white",
                border: "none",
                borderRadius: "3px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ‹ Trước
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && goToPage(page)}
                disabled={page === "..."}
                style={{
                  padding: "5px 10px",
                  backgroundColor:
                    page === currentPage
                      ? "#007bff"
                      : page === "..."
                      ? "transparent"
                      : "#e0e0e0",
                  color:
                    page === currentPage
                      ? "white"
                      : page === "..."
                      ? "#666"
                      : "black",
                  border: page === "..." ? "none" : "1px solid #ccc",
                  borderRadius: "3px",
                  cursor: page === "..." ? "default" : "pointer",
                  minWidth: "35px",
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "5px 10px",
                backgroundColor:
                  currentPage === totalPages ? "#e0e0e0" : "#007bff",
                color: currentPage === totalPages ? "#666" : "white",
                border: "none",
                borderRadius: "3px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Sau ›
            </button>
          </div>
        </div>
      )}

      {kanjiData.length === 0 ? (
        <p>Chưa có dữ liệu nào.</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ marginTop: "10px", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ width: "50px" }}>⭐</th>
              <th>Kanji</th>
              <th
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    sortBy === "hanviet" ? "#e3f2fd" : "transparent",
                  userSelect: "none",
                }}
                onClick={() => handleSort("hanviet")}
                title="Nhấp để sắp xếp theo Hán Việt"
              >
                Hán Việt{getSortIcon("hanviet")}
              </th>
              <th
                style={{
                  cursor: "pointer",
                  backgroundColor: sortBy === "kun" ? "#e3f2fd" : "transparent",
                  userSelect: "none",
                }}
                onClick={() => handleSort("kun")}
                title="Nhấp để sắp xếp theo Âm Kun"
              >
                Âm Kun{getSortIcon("kun")}
              </th>
              <th
                style={{
                  cursor: "pointer",
                  backgroundColor: sortBy === "on" ? "#e3f2fd" : "transparent",
                  userSelect: "none",
                }}
                onClick={() => handleSort("on")}
                title="Nhấp để sắp xếp theo Âm On"
              >
                Âm On{getSortIcon("on")}
              </th>
              <th colSpan={2}>Từ ví dụ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((item, idx) => {
              const rows = [];

              // Hàng đầu tiên với kanji và 2 ví dụ đầu
              rows.push(
                <tr key={`${idx}-main`}>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={markedWords.includes(item.kanji)}
                      onChange={() => handleToggleMark(item.kanji)}
                      title="Đánh dấu từ này"
                    />
                  </td>
                  <td
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      backgroundColor:
                        item.status === "new"
                          ? "#e8f5e8"
                          : item.status === "updated"
                          ? "#fff8e1"
                          : "transparent",
                    }}
                  >
                    {item.kanji}
                  </td>
                  <td>
                    {Array.isArray(item.hanviet)
                      ? item.hanviet.join("、")
                      : item.hanviet}
                  </td>
                  <td>
                    {Array.isArray(item.kun) ? item.kun.join("、") : item.kun}
                  </td>
                  <td>
                    {Array.isArray(item.on) ? item.on.join("、") : item.on}
                  </td>
                  <td>{renderExample(item.example[0])}</td>
                  <td>{renderExample(item.example[1])}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleDeleteKanji(item)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                      title={`Xóa kanji "${item.kanji}"`}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              );

              // Nếu có nhiều hơn 2 ví dụ và không tick checkbox "chỉ hiển thị 2 ví dụ đầu", thêm các hàng phụ
              if (
                item.example &&
                item.example.length > 2 &&
                !showOnlyFirstTwoExamples
              ) {
                for (let i = 2; i < item.example.length; i += 2) {
                  rows.push(
                    <tr key={`${idx}-extra-${i}`}>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{renderExample(item.example[i])}</td>
                      <td>{renderExample(item.example[i + 1])}</td>
                      <td></td>
                    </tr>
                  );
                }
              }

              return rows;
            })}
          </tbody>
        </table>
      )}

      {/* Phân trang dưới bảng */}
      {kanjiData.length > 0 && totalPages > 1 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              backgroundColor: currentPage === 1 ? "#e0e0e0" : "#007bff",
              color: currentPage === 1 ? "#666" : "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ‹‹ Đầu
          </button>

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              backgroundColor: currentPage === 1 ? "#e0e0e0" : "#007bff",
              color: currentPage === 1 ? "#666" : "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ‹ Trước
          </button>

          <span
            style={{
              padding: "8px 16px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              backgroundColor:
                currentPage === totalPages ? "#e0e0e0" : "#007bff",
              color: currentPage === totalPages ? "#666" : "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Sau ›
          </button>

          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              backgroundColor:
                currentPage === totalPages ? "#e0e0e0" : "#007bff",
              color: currentPage === totalPages ? "#666" : "white",
              border: "none",
              borderRadius: "5px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Cuối ››
          </button>
        </div>
      )}
    </div>
  );
}

export default KanjiList;
