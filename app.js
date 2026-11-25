/**
 * ============================================================================
 * 2-DAY GRAND RAAH E RAHMAT CONFERENCE - SCHOLARS VIDEO UPLOAD PORTAL
 * ============================================================================
 * Subai Jamiat Ahle Hadees Andhra Pradesh
 * Features:
 *   - 100% English-only Visible UI
 *   - Master list of 38 Conference Scholars (English single-line display)
 *   - Custom searchable dropdown with instant filtering by name or number
 *   - "Other Guest Speaker" dynamic toggle for custom scholar name
 *   - Language radio pills (Urdu, Telugu, English, Arabic)
 *   - 10-digit Indian WhatsApp number validation
 *   - HD Video file picker with drag-and-drop & live HTML5 video preview
 *   - Direct Resumable Chunked Google Drive Upload via Apps Script:
 *       1. action: "initUpload" -> gets Drive resumable uploadUrl & finalFileName
 *          (Passes scholarId, scholarEnglish, and scholarUrdu silently in background)
 *       2. XMLHttpRequest PUT -> direct uncompressed HD stream to Google Drive
 *          with live 0% → 100% Green & Gold dual-tone animated progress bar
 *       3. action: "logUpload" -> archives metadata in Google Sheets
 *   - Clean English confirmation card
 *   - Intelligent offline/demo simulation fallback for local development testing
 * ============================================================================
 */

(function () {
  "use strict";

  // Google Apps Script Web App Deployment URL
  // Replace with your active Google Apps Script Web App URL once deployed
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHQLtwibLw6rp3o2lKbjDcg3v0h2XvLDp8tAko29ijW1IddJC63NnqDIIhkfDb05TEVg/exec";

  /**
   * Master List of 38 Conference Scholars
   * Contains official English and Urdu names (Urdu passed silently to backend)
   */
  const SCHOLARS_LIST = [
    {
      id: 1,
      urdu: "فضیلۃ الشیخ زبیر احمد عمری مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Zubair Ahmad Umari Madani (Hafizahullah)"
    },
    {
      id: 2,
      urdu: "فضیلۃ الشیخ عبد الباقی عمری مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Abdul Baqi Umari Madani (Hafizahullah)"
    },
    {
      id: 3,
      urdu: "فضیلۃ الشیخ شمس الرحمن عمری مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Shamsur Rahman Umari Madani (Hafizahullah)"
    },
    {
      id: 4,
      urdu: "فضیلۃ الشیخ عبد اللہ عمری مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Abdullah Umari Madani (Hafizahullah)"
    },
    {
      id: 5,
      urdu: "فضیلۃ الشیخ عبد الرحیم صفری جامعی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Abdul Rahim Safri Jami (Hafizahullah)"
    },
    {
      id: 6,
      urdu: "فضیلۃ الشیخ اسلام الدین سلفی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Islamuddin Salafi (Hafizahullah)"
    },
    {
      id: 7,
      urdu: "فضیلۃ الشیخ شفیق عالم جامعی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Shafiq Alam Jami (Hafizahullah)"
    },
    {
      id: 8,
      urdu: "فضیلۃ الشیخ اعجاز احمد ندوی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Ijaz Ahmad Nadwi (Hafizahullah)"
    },
    {
      id: 9,
      urdu: "فضیلۃ الشیخ حافظ عبد الغنی عمری حفظہ اللہ",
      english: "Fazilat-us-Shaikh Hafiz Abdul Ghani Umari (Hafizahullah)"
    },
    {
      id: 10,
      urdu: "فضیلۃ ڈاکٹر پرویز کنولی مدنی حفظہ اللہ",
      english: "Fazilat-ud-Doctor Parvez Kanoli Madani (Hafizahullah)"
    },
    {
      id: 11,
      urdu: "فضیلۃ الشیخ ابو بکر بیگ عمری حفظہ اللہ",
      english: "Fazilat-us-Shaikh Abu Bakr Baig Umari (Hafizahullah)"
    },
    {
      id: 12,
      urdu: "داعی الیاس کاوا حفظہ اللہ",
      english: "Dai Ilyas Kawa (Hafizahullah)"
    },
    {
      id: 13,
      urdu: "فضیلۃ الشیخ ضمیر الاسلام جامعی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Zameer-ul-Islam Jami (Hafizahullah)"
    },
    {
      id: 14,
      urdu: "فضیلۃ الشیخ الطاف الرحمن عمری مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Altaf-ur-Rahman Umari Madani (Hafizahullah)"
    },
    {
      id: 15,
      urdu: "فضیلۃ الشیخ نصیر احمد عمری حفظہ اللہ",
      english: "Fazilat-us-Shaikh Naseer Ahmad Umari (Hafizahullah)"
    },
    {
      id: 16,
      urdu: "فضیلۃ الشیخ اسماعیل سلفی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Ismail Salafi (Hafizahullah)"
    },
    {
      id: 17,
      urdu: "فضیلۃ الشیخ ظفر اللہ خان ندوی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Zafarullah Khan Nadwi (Hafizahullah)"
    },
    {
      id: 18,
      urdu: "فضیلۃ الشیخ خلیل اللہ سلفی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Khalilullah Salafi (Hafizahullah)"
    },
    {
      id: 19,
      urdu: "فضیلۃ الشیخ نعمت اللہ عمری حفظہ اللہ",
      english: "Fazilat-us-Shaikh Nimatullah Umari (Hafizahullah)"
    },
    {
      id: 20,
      urdu: "فضیلۃ الشیخ ظفر الحسن مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Zafar-ul-Hasan Madani (Hafizahullah)"
    },
    {
      id: 21,
      urdu: "فضیلۃ الشیخ یاسر الہٰی محمدی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Yasir Ilahi Muhammadi (Hafizahullah)"
    },
    {
      id: 22,
      urdu: "فضیلۃ الشیخ حافظ عبد العظیم عمری مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Hafiz Abdul Azeem Umari Madani (Hafizahullah)"
    },
    {
      id: 23,
      urdu: "فضیلۃ الشیخ عبد الوکیل محمدی مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Abdul Wakeel Muhammadi Madani (Hafizahullah)"
    },
    {
      id: 24,
      urdu: "فضیلۃ ڈاکٹر سعید احمد عمری مدنی حفظہ اللہ",
      english: "Fazilat-ud-Doctor Saeed Ahmad Umari Madani (Hafizahullah)"
    },
    {
      id: 25,
      urdu: "فضیلۃ الشیخ عبد الوہاب جامعی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Abdul Wahab Jami (Hafizahullah)"
    },
    {
      id: 26,
      urdu: "فضیلۃ الشیخ ابو الحسن اشرف حفظہ اللہ",
      english: "Fazilat-us-Shaikh Abul Hasan Ashraf (Hafizahullah)"
    },
    {
      id: 27,
      urdu: "فضیلۃ الشیخ حافظ ابو ہریرہ مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Hafiz Abu Hurairah Madani (Hafizahullah)"
    },
    {
      id: 28,
      urdu: "فضیلۃ الشیخ حافظ عبد الواحد مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Hafiz Abdul Wahid Madani (Hafizahullah)"
    },
    {
      id: 29,
      urdu: "فضیلۃ الشیخ وسیم جامعی مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Waseem Jami Madani (Hafizahullah)"
    },
    {
      id: 30,
      urdu: "فضیلۃ الشیخ شاہ احمد عمری مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Shah Ahmad Umari Madani (Hafizahullah)"
    },
    {
      id: 31,
      urdu: "شیخ حافظ عبد الحسیب عمری مدنی حفظہ اللہ",
      english: "Shaikh Hafiz Abdul Haseeb Umari Madani (Hafizahullah)"
    },
    {
      id: 32,
      urdu: "فضیلۃ الشیخ عبد السلام مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Abdul Salam Madani (Hafizahullah)"
    },
    {
      id: 33,
      urdu: "فضیلۃ الشیخ طہ سعید مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Taha Saeed Madani (Hafizahullah)"
    },
    {
      id: 34,
      urdu: "فضیلۃ الشیخ شریف مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Sharif Madani (Hafizahullah)"
    },
    {
      id: 35,
      urdu: "داعی عبد الرحمن حفظہ اللہ",
      english: "Dai Abdul Rahman (Hafizahullah)"
    },
    {
      id: 36,
      urdu: "فضیلۃ الشیخ اکرام اللہ عمری حفظہ اللہ",
      english: "Fazilat-us-Shaikh Ikramullah Umari (Hafizahullah)"
    },
    {
      id: 37,
      urdu: "فضیلۃ ڈاکٹر حسین مدنی حفظہ اللہ",
      english: "Fazilat-ud-Doctor Hussain Madani (Hafizahullah)"
    },
    {
      id: 38,
      urdu: "فضیلۃ الشیخ نازل قریشی مدنی حفظہ اللہ",
      english: "Fazilat-us-Shaikh Nazil Qureshi Madani (Hafizahullah)"
    }
  ];

  // DOM Elements Cache
  const formCard = document.getElementById("formCard");
  const confirmationCard = document.getElementById("confirmationCard");
  const videoUploadForm = document.getElementById("videoUploadForm");
  const alertBanner = document.getElementById("alertBanner");
  const alertMessage = document.getElementById("alertMessage");

  // Scholar Dropdown Elements
  const scholarTriggerBtn = document.getElementById("scholarTriggerBtn");
  const scholarDropdownPanel = document.getElementById("scholarDropdownPanel");
  const scholarSearchInput = document.getElementById("scholarSearchInput");
  const scholarsListContainer = document.getElementById("scholarsListContainer");
  const triggerPlaceholder = document.getElementById("triggerPlaceholder");
  const triggerSelectedContent = document.getElementById("triggerSelectedContent");
  const selectedEnglishName = document.getElementById("selectedEnglishName");
  const scholarIdInput = document.getElementById("scholarIdInput");
  const scholarUrduInput = document.getElementById("scholarUrduInput");
  const scholarEnglishInput = document.getElementById("scholarEnglishInput");
  const customSpeakerFields = document.getElementById("customSpeakerFields");
  const customEnglishName = document.getElementById("customEnglishName");

  // Video Picker Elements
  const videoPickerZone = document.getElementById("videoPickerZone");
  const videoFileInput = document.getElementById("videoFileInput");
  const pickerEmptyContent = document.getElementById("pickerEmptyContent");
  const pickerFileCard = document.getElementById("pickerFileCard");
  const selectedFileName = document.getElementById("selectedFileName");
  const selectedFileSize = document.getElementById("selectedFileSize");
  const selectedFileType = document.getElementById("selectedFileType");
  const btnRemoveFile = document.getElementById("btnRemoveFile");
  const videoPreviewWrapper = document.getElementById("videoPreviewWrapper");
  const videoPreviewPlayer = document.getElementById("videoPreviewPlayer");

  // WhatsApp Input
  const whatsappInput = document.getElementById("whatsappInput");

  // Upload Progress Elements
  const uploadProgressCard = document.getElementById("uploadProgressCard");
  const progressStatusText = document.getElementById("progressStatusText");
  const progressPercentageText = document.getElementById("progressPercentageText");
  const progressFillBar = document.getElementById("progressFillBar");
  const progressUploadedBytes = document.getElementById("progressUploadedBytes");
  const progressSpeed = document.getElementById("progressSpeed");
  const progressEta = document.getElementById("progressEta");
  const btnSubmitUpload = document.getElementById("btnSubmitUpload");

  // Confirmation Card Elements
  const confirmScholarEnglish = document.getElementById("confirmScholarEnglish");
  const confirmLanguage = document.getElementById("confirmLanguage");
  const confirmFileSize = document.getElementById("confirmFileSize");
  const confirmFileName = document.getElementById("confirmFileName");
  const btnUploadAnother = document.getElementById("btnUploadAnother");

  // Application State
  let selectedScholarData = null; // { id, urdu, english, isOther }
  let selectedVideoFile = null;
  let activeXhr = null;
  let uploadStartTime = 0;

  /**
   * Initialize Application
   */
  function init() {
    renderScholarsList(SCHOLARS_LIST);
    setupScholarDropdownEvents();
    setupVideoPickerEvents();
    setupFormValidationEvents();
    setupFormSubmission();
    setupConfirmationEvents();
  }

  /**
   * Helper: Format bytes to human readable string (KB, MB, GB)
   */
  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  /**
   * Render Scholar Dropdown Items (Clean Single-Line English Entries)
   */
  function renderScholarsList(scholars) {
    scholarsListContainer.innerHTML = "";

    if (scholars.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "no-results-msg";
      noResults.innerHTML = "<span>No scholars matched your search.</span>";
      scholarsListContainer.appendChild(noResults);
      return;
    }

    // Render list of scholars
    scholars.forEach((scholar) => {
      const item = document.createElement("div");
      item.className = "scholar-option-item";
      item.setAttribute("role", "option");
      item.setAttribute("data-id", scholar.id);

      const formattedId = scholar.id < 10 ? `0${scholar.id}` : `${scholar.id}`;

      item.innerHTML = `
        <span class="option-english-name">#${formattedId} — ${escapeHtml(scholar.english)}</span>
        <span class="scholar-id-badge">#${formattedId}</span>
      `;

      item.addEventListener("click", () => {
        selectScholar(scholar);
      });

      scholarsListContainer.appendChild(item);
    });

    // Append "Other Guest Speaker" option at bottom
    const otherOption = document.createElement("div");
    otherOption.className = "scholar-option-item scholar-option-other";
    otherOption.setAttribute("role", "option");
    otherOption.setAttribute("data-id", "other");

    otherOption.innerHTML = `
      <span class="option-english-name" style="color: var(--gold-dark); font-weight: 700;">Other Guest Speaker (Enter Custom Name)</span>
      <span class="scholar-id-badge" style="background: var(--gold-subtle); color: var(--gold-dark); border-color: var(--gold-primary);">Custom</span>
    `;

    otherOption.addEventListener("click", () => {
      selectScholar({
        id: "other",
        urdu: "دیگر مہمان مقرر",
        english: "Other Guest Speaker",
        isOther: true
      });
    });

    scholarsListContainer.appendChild(otherOption);
  }

  /**
   * Setup Scholar Dropdown Events
   */
  function setupScholarDropdownEvents() {
    // Open/Close Dropdown
    scholarTriggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleScholarDropdown();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!scholarTriggerBtn.contains(e.target) && !scholarDropdownPanel.contains(e.target)) {
        closeScholarDropdown();
      }
    });

    // Search Filter by Name or Number
    scholarSearchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        renderScholarsList(SCHOLARS_LIST);
        return;
      }

      const filtered = SCHOLARS_LIST.filter((s) => {
        const eng = s.english.toLowerCase();
        const idStr = s.id.toString();
        const idPad = s.id < 10 ? `0${s.id}` : `${s.id}`;
        return eng.includes(query) || idStr === query || idPad === query;
      });

      renderScholarsList(filtered);
    });

    // Keyboard support
    scholarSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeScholarDropdown();
      }
    });

    // Update hidden inputs when custom name changes
    customEnglishName.addEventListener("input", updateCustomNames);
  }

  function toggleScholarDropdown() {
    const isOpen = scholarDropdownPanel.classList.contains("open");
    if (isOpen) {
      closeScholarDropdown();
    } else {
      openScholarDropdown();
    }
  }

  function openScholarDropdown() {
    scholarDropdownPanel.classList.add("open");
    scholarTriggerBtn.classList.add("active");
    scholarTriggerBtn.setAttribute("aria-expanded", "true");
    scholarSearchInput.focus();
  }

  function closeScholarDropdown() {
    scholarDropdownPanel.classList.remove("open");
    scholarTriggerBtn.classList.remove("active");
    scholarTriggerBtn.setAttribute("aria-expanded", "false");
  }

  /**
   * Handle Scholar Selection
   */
  function selectScholar(scholar) {
    selectedScholarData = scholar;
    hideAlert();

    if (scholar.isOther) {
      // Show Custom Speaker Input
      customSpeakerFields.classList.add("active");
      scholarIdInput.value = "other";
      scholarEnglishInput.value = customEnglishName.value.trim() || "Other Guest Speaker";
      scholarUrduInput.value = "دیگر مہمان مقرر";

      triggerPlaceholder.style.display = "none";
      triggerSelectedContent.style.display = "flex";
      selectedEnglishName.textContent = customEnglishName.value.trim() ? `Guest Speaker: ${customEnglishName.value.trim()}` : "Other Guest Speaker (Enter Full Name Below)";

      setTimeout(() => {
        customEnglishName.focus();
      }, 100);
    } else {
      // Pre-loaded Official Scholar
      customSpeakerFields.classList.remove("active");
      customEnglishName.value = "";

      const formattedId = scholar.id < 10 ? `0${scholar.id}` : `${scholar.id}`;
      scholarIdInput.value = scholar.id;
      scholarEnglishInput.value = scholar.english;
      scholarUrduInput.value = scholar.urdu; // Silent Urdu string for Google Sheets logging

      triggerPlaceholder.style.display = "none";
      triggerSelectedContent.style.display = "flex";
      selectedEnglishName.textContent = `#${formattedId} — ${scholar.english}`;
    }

    closeScholarDropdown();
  }

  function updateCustomNames() {
    if (!selectedScholarData || !selectedScholarData.isOther) return;

    const eng = customEnglishName.value.trim();
    scholarEnglishInput.value = eng || "Other Guest Speaker";
    scholarUrduInput.value = "دیگر مہمان مقرر";

    selectedEnglishName.textContent = eng ? `Guest Speaker: ${eng}` : "Other Guest Speaker (Enter Full Name Below)";
  }

  /**
   * Setup Video Picker & Preview Events
   */
  function setupVideoPickerEvents() {
    // Click on zone to pick file
    videoPickerZone.addEventListener("click", (e) => {
      if (e.target.closest("#btnRemoveFile")) return;
      videoFileInput.click();
    });

    // File selected via dialog
    videoFileInput.addEventListener("change", (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleVideoFile(files[0]);
      }
    });

    // Drag and Drop
    ["dragenter", "dragover"].forEach((eventName) => {
      videoPickerZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        videoPickerZone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      videoPickerZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        videoPickerZone.classList.remove("dragover");
      });
    });

    videoPickerZone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleVideoFile(files[0]);
      }
    });

    // Remove / Replace File
    btnRemoveFile.addEventListener("click", (e) => {
      e.stopPropagation();
      clearVideoFile();
    });
  }

  /**
   * Handle Chosen Video File
   */
  function handleVideoFile(file) {
    hideAlert();

    // Verify it is a video file or common video extension
    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|mkv|webm|avi|m4v|3gp)$/i.test(file.name);
    if (!isVideo) {
      showAlert("Please select a valid video file (MP4, MOV, MKV, WebM).");
      return;
    }

    selectedVideoFile = file;

    // Update UI elements
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = formatBytes(file.size);

    // Extract extension for badge
    const ext = file.name.split(".").pop().toUpperCase() || "VIDEO";
    selectedFileType.textContent = ext;

    pickerEmptyContent.style.display = "none";
    pickerFileCard.classList.add("visible");
    videoPickerZone.classList.add("has-file");

    // Load HTML5 Video Preview if playable
    try {
      const fileUrl = URL.createObjectURL(file);
      videoPreviewPlayer.src = fileUrl;
      videoPreviewWrapper.classList.add("visible");
    } catch (err) {
      console.warn("Could not create object URL for video preview:", err);
    }
  }

  /**
   * Clear Selected Video File
   */
  function clearVideoFile() {
    selectedVideoFile = null;
    videoFileInput.value = "";

    pickerFileCard.classList.remove("visible");
    pickerEmptyContent.style.display = "flex";
    videoPickerZone.classList.remove("has-file");

    if (videoPreviewPlayer.src) {
      URL.revokeObjectURL(videoPreviewPlayer.src);
      videoPreviewPlayer.src = "";
    }
    videoPreviewWrapper.classList.remove("visible");
  }

  /**
   * Setup Form Validation Events
   */
  function setupFormValidationEvents() {
    // Restrict WhatsApp input to digits only
    whatsappInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  /**
   * Validate Form
   */
  function validateForm() {
    // 1. Scholar Selection
    if (!selectedScholarData) {
      showAlert("Please select a scholar from the list.");
      scholarTriggerBtn.scrollIntoView({ behavior: "smooth", block: "center" });
      openScholarDropdown();
      return false;
    }

    if (selectedScholarData.isOther) {
      const eng = customEnglishName.value.trim();
      if (!eng) {
        showAlert("Please enter the full name for the guest speaker.");
        customEnglishName.focus();
        return false;
      }
    }

    // 2. Video Language
    const langRadio = document.querySelector('input[name="videoLanguage"]:checked');
    if (!langRadio) {
      showAlert("Please choose the video language.");
      return false;
    }

    // 3. WhatsApp (Optional, but if filled must be 10 digits starting with 6,7,8,9)
    const phone = whatsappInput.value.trim();
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      showAlert("Please enter a valid 10-digit Indian WhatsApp mobile number.");
      whatsappInput.focus();
      return false;
    }

    // 4. Video File
    if (!selectedVideoFile) {
      showAlert("Please select or drop the recorded promotional video.");
      videoPickerZone.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    hideAlert();
    return true;
  }

  /**
   * Setup Form Submission & Resumable Direct Upload
   */
  function setupFormSubmission() {
    videoUploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const langRadio = document.querySelector('input[name="videoLanguage"]:checked');
      const language = langRadio ? langRadio.value : "Urdu";
      const whatsapp = whatsappInput.value.trim() ? `+91 ${whatsappInput.value.trim()}` : "";

      const scholarId = selectedScholarData.id;
      const scholarEnglish = selectedScholarData.isOther ? customEnglishName.value.trim() : selectedScholarData.english;
      // Silent Urdu text passed to Google Sheets backend
      const scholarUrdu = selectedScholarData.isOther ? "دیگر مہمان مقرر" : selectedScholarData.urdu;

      // Start upload procedure
      await startDirectResumableUpload({
        file: selectedVideoFile,
        scholarId,
        scholarEnglish,
        scholarUrdu,
        language,
        whatsapp
      });
    });
  }

  /**
   * Direct Resumable Chunked Google Drive Upload Flow
   */
  async function startDirectResumableUpload(uploadData) {
    const { file, scholarId, scholarEnglish, scholarUrdu, language, whatsapp } = uploadData;

    setFormDisabledState(true);
    uploadProgressCard.classList.add("active");
    uploadProgressCard.scrollIntoView({ behavior: "smooth", block: "center" });
    uploadStartTime = Date.now();

    updateProgressUI(0, 0, file.size, "Initializing secure session with Google Drive...");

    try {
      const initPayload = {
        action: "initUpload",
        scholarId: scholarId === "other" ? 99 : scholarId,
        scholarEnglish: scholarEnglish,
        scholarUrdu: scholarUrdu,
        language: language,
        whatsapp: whatsapp,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "video/mp4",
        origin: window.location.origin
      };

      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(initPayload)
      });

      if (!res.ok) {
        throw new Error(`Backend HTTP ${res.status}: ${res.statusText}`);
      }

      const initResponse = await res.json();

      if (initResponse && (initResponse.status === "success" || initResponse.success) && initResponse.uploadUrl) {
        await streamFileToDrive(initResponse.uploadUrl, file, initResponse.finalFileName, uploadData);
      } else {
        throw new Error((initResponse && initResponse.message) || "Could not create Google Drive upload session.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showAlert(`Upload failed: ${err.message || err}`);
      setFormDisabledState(false);
      uploadProgressCard.classList.remove("active");
    }
  }

  /**
   * Stream File directly to Google Drive via XMLHttpRequest PUT
   */
  function streamFileToDrive(uploadUrl, file, finalFileName, uploadData) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      activeXhr = xhr;

      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
          updateProgressUI(percent, e.loaded, e.total, "Streaming uncompressed HD video to Google Drive...");
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          updateProgressUI(100, file.size, file.size, "Finalizing upload & archiving metadata...");

          let driveFileId = "";
          try {
            const resp = JSON.parse(xhr.responseText);
            driveFileId = resp.id || "";
          } catch (e) {}

          const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

          const logRes = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              action: "logUpload",
              fileId: driveFileId,
              finalFileName: finalFileName,
              scholarId: uploadData.scholarId === "other" ? "Other" : uploadData.scholarId,
              scholarEnglish: uploadData.scholarEnglish,
              scholarUrdu: uploadData.scholarUrdu,
              language: uploadData.language,
              whatsapp: uploadData.whatsapp,
              fileSizeMB: sizeInMB
            })
          });

          const logData = await logRes.json();
          if (logData.status !== "success" && !logData.success) {
            reject(new Error(logData.message || "Video uploaded to Drive, but failed to log in Google Sheets."));
            return;
          }

          showConfirmationCard({
            scholarEnglish: uploadData.scholarEnglish,
            language: uploadData.language,
            fileSizeFormatted: formatBytes(file.size),
            finalFileName: finalFileName
          });

          resolve();
        } else {
          reject(new Error(`Google Drive returned status ${xhr.status}: ${xhr.responseText || xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network/CORS error while streaming video to Google Drive. Please test from your live HTTPS GitHub Pages URL."));
      };

      xhr.send(file);
    });
  }

  /**
   * Update Live Progress UI (Speed, ETA, Percent)
   */
  function updateProgressUI(percent, loaded, total, statusText) {
    progressFillBar.style.width = `${percent}%`;
    progressPercentageText.textContent = percent;
    progressUploadedBytes.textContent = `${formatBytes(loaded)} of ${formatBytes(total)}`;

    if (statusText) {
      progressStatusText.textContent = statusText;
    }

    const elapsedSec = (Date.now() - uploadStartTime) / 1000;
    if (elapsedSec > 0.5 && loaded > 0) {
      const bytesPerSec = loaded / elapsedSec;
      progressSpeed.textContent = `${formatBytes(bytesPerSec)}/s`;

      const remainingBytes = Math.max(0, total - loaded);
      const remainingSec = Math.round(remainingBytes / bytesPerSec);

      if (remainingSec > 60) {
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        progressEta.textContent = `${mins}m ${secs}s remaining`;
      } else if (remainingSec > 0) {
        progressEta.textContent = `${remainingSec}s remaining`;
      } else {
        progressEta.textContent = "Almost complete";
      }
    } else {
      progressSpeed.textContent = "Calculating...";
      progressEta.textContent = "Estimating...";
    }
  }

  /**
   * Set Form Disabled State during Upload
   */
  function setFormDisabledState(disabled) {
    btnSubmitUpload.disabled = disabled;
    scholarTriggerBtn.disabled = disabled;
    videoFileInput.disabled = disabled;
    whatsappInput.disabled = disabled;
    customEnglishName.disabled = disabled;

    const radios = document.querySelectorAll('input[name="videoLanguage"]');
    radios.forEach((r) => (r.disabled = disabled));

    if (btnRemoveFile) {
      btnRemoveFile.disabled = disabled;
    }
  }

  /**
   * Display Confirmation Card (Clean English)
   */
  function showConfirmationCard(details) {
    // Populate details box
    confirmScholarEnglish.textContent = details.scholarEnglish;
    confirmLanguage.textContent = details.language;
    confirmFileSize.textContent = details.fileSizeFormatted;
    confirmFileName.textContent = details.finalFileName;

    // Switch view
    formCard.style.display = "none";
    confirmationCard.classList.add("active");
    confirmationCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * Setup Confirmation Card Actions
   */
  function setupConfirmationEvents() {
    btnUploadAnother.addEventListener("click", () => {
      // Reset form
      videoUploadForm.reset();
      clearVideoFile();

      // Reset scholar selection
      selectedScholarData = null;
      scholarIdInput.value = "";
      scholarUrduInput.value = "";
      scholarEnglishInput.value = "";
      customSpeakerFields.classList.remove("active");
      customEnglishName.value = "";

      triggerSelectedContent.style.display = "none";
      triggerPlaceholder.style.display = "flex";

      // Reset progress
      uploadProgressCard.classList.remove("active");
      progressFillBar.style.width = "0%";
      progressPercentageText.textContent = "0";

      // Enable inputs
      setFormDisabledState(false);

      // Show form, hide confirmation
      confirmationCard.classList.remove("active");
      formCard.style.display = "block";
      formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /**
   * Alert Banner Utilities
   */
  function showAlert(msg) {
    alertMessage.textContent = msg;
    alertBanner.classList.add("visible");
    alertBanner.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideAlert() {
    alertBanner.classList.remove("visible");
  }

  /**
   * String escaping helper
   */
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initialize once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
