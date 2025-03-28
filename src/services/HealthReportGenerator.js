import jsPDF from "jspdf";
import logo from "../assets/full_logo.png";

class HealthReportGenerator {
  constructor(member, child, alert, growthRecord) {
    this.member = member || {};
    this.child = child || {};
    this.alert = alert || null;
    this.growthRecord = growthRecord || null;
    this.doc = new jsPDF();
    this.logoBase64 = null;
  }

  // Hàm chuyển URL hình ảnh thành base64
  async loadImageToBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  }

  // Hàm loại bỏ dấu tiếng Việt
  removeDiacritics(str) {
    if (!str) return "N/A";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  // Định dạng ngày
  formatDate(dateString) {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "N/A";
  }

  // Thêm tiêu đề và logo
  async addHeader() {
    // Chuyển logo thành base64
    this.logoBase64 = await this.loadImageToBase64(logo);
    if (this.logoBase64) {
      // Thêm logo vào góc trên cùng bên trái
      this.doc.addImage(this.logoBase64, "PNG", 5, 5, 35, 10); // Kích thước logo: 35x10mm
    } else {
      console.warn("Could not load logo for PDF.");
    }

    // Tiêu đề (giữ nguyên vị trí ban đầu)
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 102, 204); // Màu xanh đậm
    this.doc.text("Child Health Report", 105, 20, { align: "center" });

    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0); // Màu đen
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Generated on: ${this.formatDate(new Date())}`, 105, 30, { align: "center" });

    // Thêm đường kẻ ngang
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(0, 102, 204);
    this.doc.line(20, 35, 190, 35); // Giữ nguyên vị trí ban đầu
  }

  // Thêm thông tin Member dưới dạng văn bản
  addMemberInfo() {
    const memberNameWithoutDiacritics = this.removeDiacritics(this.member.name);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 102, 204);
    this.doc.text("Member Information", 20, 40); // Giữ nguyên vị trí ban đầu

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Name: ${memberNameWithoutDiacritics}`, 20, 50);
  }

  // Thêm thông tin Child dưới dạng văn bản
  addChildInfo() {
    const childNameWithoutDiacritics = this.removeDiacritics(this.child.name);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 102, 204);
    this.doc.text("Child Information", 20, 70); // Giữ nguyên vị trí ban đầu

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Name: ${childNameWithoutDiacritics}`, 20, 80);
    this.doc.text(`Date of Birth: ${this.formatDate(this.child.dateOfBirth)}`, 20, 90);
    this.doc.text(`Gender: ${this.child.gender || "N/A"}`, 20, 100);
  }

  // Thêm thông tin Alert mới nhất dưới dạng văn bản
  addAlertInfo() {
    const message = this.alert ? this.alert.message || "No message" : "No recent alert available.";

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 102, 204);
    this.doc.text("Latest Alert", 20, 110); // Giữ nguyên vị trí ban đầu

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);

    if (this.alert) {
      this.doc.text(`Date: ${this.formatDate(this.alert.alertDate)}`, 20, 120);
      this.doc.text(`Severity: ${this.alert.severityLevel || "N/A"}`, 20, 130);

      // Chia nhỏ message nếu quá dài
      const textLines = this.doc.splitTextToSize(`Message: ${message}`, 170); // 170mm là chiều rộng khả dụng
      this.doc.text(textLines, 20, 140);

      // Trả về vị trí Y cuối cùng của message
      return 140 + textLines.length * 10; // Ước lượng chiều cao của message
    } else {
      this.doc.text("Message: No recent alert available.", 20, 120);
      return 120;
    }
  }

  // Thêm thông tin Growth Record mới nhất dưới dạng văn bản
  addGrowthRecordInfo(lastY) {
    const startY = lastY + 10;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 102, 204);
    this.doc.text("Latest Growth Record", 20, startY);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);

    if (this.growthRecord) {
      this.doc.text(`Date: ${this.formatDate(this.growthRecord.createdAt)}`, 20, startY + 10);
      this.doc.text(`Weight: ${this.growthRecord.weight ? `${this.growthRecord.weight} kg` : "N/A"}`, 20, startY + 20);
      this.doc.text(`Height: ${this.growthRecord.height ? `${this.growthRecord.height} cm` : "N/A"}`, 20, startY + 30);
      this.doc.text(`Head Circumference: ${this.growthRecord.headCircumference ? `${this.growthRecord.headCircumference} cm` : "N/A"}`, 20, startY + 40);
      this.doc.text(`Notes: ${this.growthRecord.notes || "N/A"}`, 20, startY + 50);
    } else {
      this.doc.text("Message: No recent growth record available.", 20, startY + 10);
    }
  }

  // Tạo và lưu file PDF
  async generatePDF() {
    await this.addHeader(); // Đợi logo được thêm
    this.addMemberInfo();
    this.addChildInfo();
    const lastY = this.addAlertInfo();
    this.addGrowthRecordInfo(lastY);

    // Loại bỏ dấu cho childName trước khi lưu file
    const childName = this.child.name ? this.removeDiacritics(this.child.name).replace(/\s+/g, "_") : "Child";
    this.doc.save(`Health_Report_${childName}_${this.formatDate(new Date())}.pdf`);
  }
}

export default HealthReportGenerator;