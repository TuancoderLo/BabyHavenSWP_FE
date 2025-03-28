import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable

class HealthReportGenerator {
  constructor(member, child, alert, growthRecord) {
    this.member = member || {};
    this.child = child || {};
    this.alert = alert || null;
    this.growthRecord = growthRecord || null;
    this.doc = new jsPDF();
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

  // Thêm tiêu đề
  addHeader() {
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
    this.doc.line(20, 35, 190, 35);
  }

  // Thêm thông tin Member dưới dạng bảng
  addMemberInfo() {
    autoTable(this.doc, {
      startY: 40,
      head: [["Member Information"]],
      body: [
        ["Name", this.member.name || "N/A"],
        ["Email", this.member.email || "N/A"],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [0, 102, 204], // Màu xanh đậm
        textColor: [255, 255, 255], // Màu trắng
        fontSize: 14,
        font: "helvetica",
        fontStyle: "bold",
      },
      bodyStyles: {
        font: "helvetica",
        fontStyle: "normal",
        fontSize: 12,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" }, // Cột nhãn (Name, Email) in đậm
        1: { cellWidth: 120 },
      },
      margin: { left: 20, right: 20 },
    });
  }

  // Thêm thông tin Child dưới dạng bảng
  addChildInfo() {
    const lastY = this.doc.lastAutoTable ? this.doc.lastAutoTable.finalY + 5 : 40;
    autoTable(this.doc, {
      startY: lastY,
      head: [["Child Information"]],
      body: [
        ["Name", this.child.name || "N/A"],
        ["Date of Birth", this.formatDate(this.child.dateOfBirth)],
        ["Gender", this.child.gender || "N/A"],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 14,
        font: "helvetica",
        fontStyle: "bold",
      },
      bodyStyles: {
        font: "helvetica",
        fontStyle: "normal",
        fontSize: 12,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: 120 },
      },
      margin: { left: 20, right: 20 },
    });
  }

  // Thêm thông tin Alert mới nhất dưới dạng bảng
  addAlertInfo() {
    const lastY = this.doc.lastAutoTable ? this.doc.lastAutoTable.finalY + 5 : 40;
    const message = this.alert ? this.alert.message || "No message" : "No recent alert available.";

    autoTable(this.doc, {
      startY: lastY,
      head: [["Latest Alert"]],
      body: this.alert
        ? [
            ["Date", this.formatDate(this.alert.alertDate)],
            ["Severity", this.alert.severityLevel || "N/A"],
            ["Message", message],
          ]
        : [["Message", "No recent alert available."]],
      theme: "striped",
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 14,
        font: "helvetica",
        fontStyle: "bold",
      },
      bodyStyles: {
        font: "helvetica",
        fontStyle: "normal",
        fontSize: 12,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: 120 },
      },
      margin: { left: 20, right: 20 },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.cell.section === "body" && data.row.index === 2) {
          // Chia nhỏ message nếu quá dài
          const textLines = this.doc.splitTextToSize(data.cell.raw, 120);
          data.cell.text = textLines;
        }
      },
    });

    return this.doc.lastAutoTable ? this.doc.lastAutoTable.finalY : lastY;
  }

  // Thêm thông tin Growth Record mới nhất dưới dạng bảng
  addGrowthRecordInfo(lastY) {
    const startY = lastY + 5;
    autoTable(this.doc, {
      startY: startY,
      head: [["Latest Growth Record"]],
      body: this.growthRecord
        ? [
            ["Date", this.formatDate(this.growthRecord.createdAt)],
            ["Weight", this.growthRecord.weight ? `${this.growthRecord.weight} kg` : "N/A"],
            ["Height", this.growthRecord.height ? `${this.growthRecord.height} cm` : "N/A"],
            ["Head Circumference", this.growthRecord.headCircumference ? `${this.growthRecord.headCircumference} cm` : "N/A"],
            ["Notes", this.growthRecord.notes || "N/A"],
          ]
        : [["Message", "No recent growth record available."]],
      theme: "striped",
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 14,
        font: "helvetica",
        fontStyle: "bold",
      },
      bodyStyles: {
        font: "helvetica",
        fontStyle: "normal",
        fontSize: 12,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: 120 },
      },
      margin: { left: 20, right: 20 },
    });
  }

  // Tạo và lưu file PDF
  generatePDF() {
    this.addHeader();
    this.addMemberInfo();
    this.addChildInfo();
    const lastY = this.addAlertInfo();
    this.addGrowthRecordInfo(lastY);

    const childName = this.child.name ? this.child.name.replace(/\s+/g, "_") : "Child";
    this.doc.save(`Health_Report_${childName}_${this.formatDate(new Date())}.pdf`);
  }
}

export default HealthReportGenerator;