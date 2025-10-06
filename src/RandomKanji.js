import React, { useState, useEffect } from "react";
import ExampleWords from "./components/ExampleWords";
import KanjiQuiz from "./components/KanjiQuiz";
import { hiraganaToRomaji, isReadingMatch } from "./utils/romajiUtils";

function RandomKanji({ kanjiData }) {
  // Configuration states
  const [showConfig, setShowConfig] = useState(true);
  const [displayMode, setDisplayMode] = useState("random"); // 'random' hoặc 'order'
  const [kanjiTypes, setKanjiTypes] = useState({
    existing: true,
    updated: true,
    new: true,
    learned: true,
    marked: true,
  });
  const [filteredKanjiData, setFilteredKanjiData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [kanjiHistory, setKanjiHistory] = useState([]); // Track visited kanji for previous navigation

  // Quiz states
  const [currentKanji, setCurrentKanji] = useState(null);
  const [userAnswers, setUserAnswers] = useState({
    hanviet: "",
    kun: [],
    on: [],
  });
  const [skipFields, setSkipFields] = useState(() => {
    const saved = localStorage.getItem("kanjiQuiz_skipFields");
    return saved
      ? JSON.parse(saved)
      : {
          hanviet: false,
          kun: false,
          on: false,
        };
  });
  const [romajiMode, setRomajiMode] = useState(() => {
    const saved = localStorage.getItem("kanjiQuiz_romajiMode");
    return saved
      ? JSON.parse(saved)
      : {
          kun: false,
          on: false,
        };
  });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState({
    hanviet: false,
    kun: false,
    on: false,
  });

  // Marked words state
  const [markedWords, setMarkedWords] = useState(() => {
    const saved = localStorage.getItem("markedWords");
    return saved ? JSON.parse(saved) : [];
  });

  // Save skipFields and romajiMode to localStorage when they change
  useEffect(() => {
    localStorage.setItem("kanjiQuiz_skipFields", JSON.stringify(skipFields));
  }, [skipFields]);

  useEffect(() => {
    localStorage.setItem("kanjiQuiz_romajiMode", JSON.stringify(romajiMode));
  }, [romajiMode]);

  // Save markedWords to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("markedWords", JSON.stringify(markedWords));
  }, [markedWords]);

  // Filter and prepare kanji data based on selected types
  const filterKanjiData = () => {
    const learnedKanjiList = getLearnedKanji();

    return kanjiData.filter((kanji) => {
      // Kiểm tra nếu kanji này thuộc loại "learned"
      const isLearned = learnedKanjiList.includes(kanji.kanji);

      // Kiểm tra nếu kanji này thuộc loại "marked"
      const isMarked = markedWords.includes(kanji.kanji);

      // Nếu tick "marked" và kanji này đã được đánh dấu
      if (kanjiTypes.marked && isMarked) {
        return true;
      }

      // Nếu tick "learned" và kanji này đã học
      if (kanjiTypes.learned && isLearned) {
        return true;
      }

      // Kiểm tra các loại kanji thông thường (existing, updated, new)
      const status = kanji.status || "existing";
      if (kanjiTypes[status]) {
        // Chỉ include nếu kanji này KHÔNG thuộc "learned" và "marked" (tránh trùng lặp)
        return !isLearned && !isMarked;
      }

      return false;
    });
  };

  // Lấy danh sách kanji đã học từ Daily Learning
  const getLearnedKanji = () => {
    const dailyProgress = JSON.parse(
      localStorage.getItem("dailyProgress") || "{}"
    );
    const learningPlan = JSON.parse(
      localStorage.getItem("dailyLearningPlan") || "[]"
    );
    const learnedKanji = [];

    // Duyệt qua tất cả các ngày đã hoàn thành
    Object.keys(dailyProgress).forEach((dayKey) => {
      const dayNumber = parseInt(dayKey.replace("day", ""));
      const dayPlan = learningPlan[dayNumber - 1];

      if (dayPlan && dayPlan.kanji) {
        const completedIndices = dailyProgress[dayKey] || [];
        // Nếu hoàn thành tất cả kanji trong ngày đó
        if (completedIndices.length === dayPlan.kanji.length) {
          dayPlan.kanji.forEach((kanji) => {
            if (!learnedKanji.includes(kanji.kanji)) {
              learnedKanji.push(kanji.kanji);
            }
          });
        }
      }
    });

    return learnedKanji;
  };

  // Start quiz with selected configuration
  const startQuiz = () => {
    const filtered = filterKanjiData();
    if (filtered.length === 0) {
      alert("Không có kanji nào phù hợp với lựa chọn của bạn!");
      return;
    }

    setFilteredKanjiData(filtered);
    setCurrentIndex(0);
    setShowConfig(false);
    setKanjiHistory([]); // Reset history when starting new quiz

    // Select first kanji (don't add to history)
    selectKanji(filtered, 0, false);
  };

  // Select kanji based on mode and index
  const selectKanji = (dataArray, index, addToHistory = true) => {
    if (dataArray.length === 0) return;

    let selectedKanji;
    if (displayMode === "random") {
      const randomIndex = Math.floor(Math.random() * dataArray.length);
      selectedKanji = dataArray[randomIndex];
    } else {
      selectedKanji = dataArray[index % dataArray.length];
    }

    setCurrentKanji(selectedKanji);
    setShowResult(false);

    // Add to history only when explicitly requested (not during initialization)
    if (addToHistory) {
      setKanjiHistory((prev) => {
        // Avoid duplicating if it's the same kanji
        if (
          prev.length === 0 ||
          prev[prev.length - 1]?.kanji !== selectedKanji.kanji
        ) {
          return [...prev, selectedKanji];
        }
        return prev;
      });
    }

    // Initialize userAnswers based on readings count
    const kunCount = Array.isArray(selectedKanji.kun)
      ? selectedKanji.kun.filter((r) => r.trim() !== "").length
      : selectedKanji.kun && selectedKanji.kun.trim() !== ""
      ? 1
      : 0;
    const onCount = Array.isArray(selectedKanji.on)
      ? selectedKanji.on.filter((r) => r.trim() !== "").length
      : selectedKanji.on && selectedKanji.on.trim() !== ""
      ? 1
      : 0;

    setUserAnswers({
      hanviet: "",
      kun: new Array(kunCount).fill(""),
      on: new Array(onCount).fill(""),
    });
    // Keep skipFields and romajiMode unchanged to preserve user preferences
    setIsCorrect({ hanviet: false, kun: false, on: false });
  };

  // Handle going back to previous kanji
  const handlePrevious = () => {
    if (kanjiHistory.length > 1) {
      // Remove current kanji from history and get previous one
      const newHistory = [...kanjiHistory];
      newHistory.pop(); // Remove current
      const previousKanji = newHistory[newHistory.length - 1];

      setKanjiHistory(newHistory);
      setCurrentKanji(previousKanji);
      setShowResult(false);

      // Reset user answers for the previous kanji
      const kunCount = Array.isArray(previousKanji.kun)
        ? previousKanji.kun.filter((r) => r.trim() !== "").length
        : previousKanji.kun && previousKanji.kun.trim() !== ""
        ? 1
        : 0;
      const onCount = Array.isArray(previousKanji.on)
        ? previousKanji.on.filter((r) => r.trim() !== "").length
        : previousKanji.on && previousKanji.on.trim() !== ""
        ? 1
        : 0;

      setUserAnswers({
        hanviet: "",
        kun: new Array(kunCount).fill(""),
        on: new Array(onCount).fill(""),
      });
      setIsCorrect({ hanviet: false, kun: false, on: false });
    }
  };

  // Handle checkbox changes
  const handleKanjiTypeChange = (type) => {
    setKanjiTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Chọn kanji ngẫu nhiên khi component load hoặc khi data thay đổi - chỉ nếu đã bắt đầu quiz
  useEffect(() => {
    if (kanjiData.length > 0 && !showConfig && filteredKanjiData.length > 0) {
      selectKanji(filteredKanjiData, currentIndex);
    }
  }, [kanjiData, showConfig]);

  const handleInputChange = (field, value, index = null) => {
    setUserAnswers((prev) => {
      if (field === "hanviet") {
        return { ...prev, [field]: value };
      } else {
        // For kun and on arrays
        const newArray = [...prev[field]];
        newArray[index] = value;
        return { ...prev, [field]: newArray };
      }
    });
  };

  const handleSkipFieldChange = (field, isSkipped) => {
    setSkipFields((prev) => ({
      ...prev,
      [field]: isSkipped,
    }));
  };

  const handleRomajiModeChange = (field, isRomaji) => {
    setRomajiMode((prev) => ({
      ...prev,
      [field]: isRomaji,
    }));
  };

  // Hàm kiểm tra xem reading có tồn tại không
  const hasReading = (reading) => {
    if (!reading) return false;
    if (Array.isArray(reading)) {
      return reading.length > 0 && reading.some((r) => r.trim() !== "");
    }
    return reading.trim() !== "";
  };

  const handleAnswerResult = (results, allCorrect, kanji) => {
    setIsCorrect(results);
    setShowResult(true);
    // RandomKanji không cần xử lý gì đặc biệt, chỉ cập nhật UI
  };

  const getNextKanji = () => {
    if (filteredKanjiData.length > 0) {
      const nextIndex =
        displayMode === "order" ? currentIndex + 1 : currentIndex;
      setCurrentIndex(nextIndex);
      selectKanji(filteredKanjiData, nextIndex, true); // Add to history when moving next
    }
  };

  // Mark/unmark functions
  const handleToggleMark = () => {
    if (!currentKanji) return;

    const isCurrentlyMarked = markedWords.includes(currentKanji.kanji);

    if (isCurrentlyMarked) {
      // Remove from marked words
      setMarkedWords((prev) =>
        prev.filter((word) => word !== currentKanji.kanji)
      );
    } else {
      // Add to marked words
      setMarkedWords((prev) => [...prev, currentKanji.kanji]);
    }
  };

  const isCurrentKanjiMarked = currentKanji
    ? markedWords.includes(currentKanji.kanji)
    : false;

  if (kanjiData.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Học chữ ngẫu nhiên</h2>
        <p>Vui lòng tải file Excel để bắt đầu học!</p>
      </div>
    );
  }

  // Configuration screen
  if (showConfig) {
    const stats = {
      existing: kanjiData.filter((k) => !k.status || k.status === "existing")
        .length,
      updated: kanjiData.filter((k) => k.status === "updated").length,
      new: kanjiData.filter((k) => k.status === "new").length,
      learned: getLearnedKanji().length,
      marked: markedWords.length,
    };

    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h2>Bạn muốn kiểm tra theo cách nào</h2>

        {/* Display mode selection */}
        <div
          style={{
            marginBottom: "25px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#495057" }}>
            🔄 Cách các chữ xuất hiện:
          </h3>
          <div style={{ display: "flex", gap: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="displayMode"
                value="random"
                checked={displayMode === "random"}
                onChange={(e) => setDisplayMode(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              <span>Ngẫu nhiên</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="displayMode"
                value="order"
                checked={displayMode === "order"}
                onChange={(e) => setDisplayMode(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              <span>Theo thứ tự</span>
            </label>
          </div>
        </div>

        {/* Kanji type selection */}
        <div
          style={{
            marginBottom: "25px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#495057" }}>
            📝 Các chữ kanji kiểm tra:
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={kanjiTypes.existing}
                onChange={() => handleKanjiTypeChange("existing")}
                style={{ marginRight: "10px" }}
              />
              <span>✅ Từ cũ ({stats.existing} từ)</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={kanjiTypes.updated}
                onChange={() => handleKanjiTypeChange("updated")}
                style={{ marginRight: "10px" }}
              />
              <span>🔄 Từ mới cập nhật ({stats.updated} từ)</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={kanjiTypes.new}
                onChange={() => handleKanjiTypeChange("new")}
                style={{ marginRight: "10px" }}
              />
              <span>🆕 Từ mới thêm vào ({stats.new} từ)</span>
            </label>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                backgroundColor: "#dee2e6",
                margin: "8px 0",
              }}
            ></div>

            {/* Learned Kanji Filter */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={kanjiTypes.learned}
                onChange={() => handleKanjiTypeChange("learned")}
                style={{ marginRight: "10px" }}
              />
              <span>📚 Các từ đã học ({stats.learned} từ)</span>
            </label>

            {/* Marked Kanji Filter */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={kanjiTypes.marked}
                onChange={() => handleKanjiTypeChange("marked")}
                style={{ marginRight: "10px" }}
              />
              <span>⭐ Các từ đã đánh dấu ({stats.marked} từ)</span>
            </label>
          </div>

          {/* Summary */}
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#e9ecef",
              borderRadius: "5px",
              fontSize: "14px",
            }}
          >
            <strong>Tổng số từ sẽ kiểm tra: </strong>
            {filterKanjiData().length} / {kanjiData.length} từ
          </div>
        </div>

        {/* Start button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={startQuiz}
            disabled={filterKanjiData().length === 0}
            style={{
              padding: "12px 30px",
              fontSize: "18px",
              backgroundColor:
                filterKanjiData().length === 0 ? "#6c757d" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                filterKanjiData().length === 0 ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            🚀 Bắt đầu kiểm tra
          </button>
          {filterKanjiData().length === 0 && (
            <p
              style={{ color: "#dc3545", marginTop: "10px", fontSize: "14px" }}
            >
              Vui lòng chọn ít nhất một loại kanji để kiểm tra
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!currentKanji) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Đang tải...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Học chữ ngẫu nhiên</h2>
        <button
          onClick={() => setShowConfig(true)}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ⚙️ Cấu hình
        </button>
      </div>

      <KanjiQuiz
        currentKanji={currentKanji}
        userAnswers={userAnswers}
        skipFields={skipFields}
        romajiMode={romajiMode}
        showResult={showResult}
        isCorrect={isCorrect}
        onInputChange={handleInputChange}
        onSkipFieldChange={handleSkipFieldChange}
        onRomajiModeChange={handleRomajiModeChange}
        enableBuiltInValidation={true}
        onAnswerResult={handleAnswerResult}
        onNext={getNextKanji}
        onPrevious={kanjiHistory.length > 1 ? handlePrevious : null}
        isMarked={isCurrentKanjiMarked}
        onToggleMark={handleToggleMark}
      />

      {showResult && currentKanji.example && (
        <ExampleWords examples={currentKanji.example} />
      )}
    </div>
  );
}

export default RandomKanji;
