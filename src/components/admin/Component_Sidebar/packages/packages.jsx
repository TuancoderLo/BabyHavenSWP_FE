import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import packageApi from "../../../../services/packageApi";

function Packages() {
  const [packages, setPackages] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    packageId: "",
    packageName: "",
    description: "",
    price: "",
    currency: "VND",
    durationMonths: "",
    trialPeriodDays: "",
    maxChildrenAllowed: "",
    supportLevel: "",
    status: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageApi.getAllPackages();
      console.log("Dữ liệu từ API:", response.data);
      setPackages(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói:", error);
    }
  };

  const handleOpen = (pkg = null) => {
    if (pkg) {
      console.log("Package được chọn để edit:", pkg);
      const packageId =
        pkg.packageId || pkg.id || pkg.Id || pkg.membershipPackageId;
      if (!packageId) {
        console.error("Package không có ID:", pkg);
        alert("Lỗi: Không tìm thấy ID của gói");
        return;
      }
      setEditMode(true);
      setSelectedPackage({ ...pkg, packageId: packageId });
      setFormData({
        packageName: pkg.packageName,
        description: pkg.description,
        price: pkg.price,
        currency: pkg.currency || "VND",
        durationMonths: pkg.durationMonths,
        trialPeriodDays: pkg.trialPeriodDays || "",
        maxChildrenAllowed: pkg.maxChildrenAllowed,
        supportLevel: pkg.supportLevel || "",
        status: pkg.status,
      });
    } else {
      setEditMode(false);
      setSelectedPackage(null);
      setFormData({
        packageName: "",
        description: "",
        price: "",
        currency: "VND",
        durationMonths: "",
        trialPeriodDays: "",
        maxChildrenAllowed: "",
        supportLevel: "",
        status: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.packageName.trim()) {
      tempErrors.packageName = "Vui lòng nhập tên gói";
      isValid = false;
    }

    if (!formData.description.trim()) {
      tempErrors.description = "Vui lòng nhập mô tả";
      isValid = false;
    }

    if (!formData.price) {
      tempErrors.price = "Vui lòng nhập giá";
      isValid = false;
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      tempErrors.price = "Giá phải là số dương";
      isValid = false;
    }

    if (!formData.durationMonths) {
      tempErrors.durationMonths = "Vui lòng nhập thời hạn";
      isValid = false;
    } else if (
      isNaN(formData.durationMonths) ||
      Number(formData.durationMonths) <= 0
    ) {
      tempErrors.durationMonths = "Thời hạn phải là số dương";
      isValid = false;
    }

    if (!formData.maxChildrenAllowed) {
      tempErrors.maxChildrenAllowed = "Vui lòng nhập số trẻ tối đa";
      isValid = false;
    } else if (
      isNaN(formData.maxChildrenAllowed) ||
      Number(formData.maxChildrenAllowed) <= 0
    ) {
      tempErrors.maxChildrenAllowed = "Số trẻ tối đa phải là số dương";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      console.log("FormData trước khi gửi:", formData);
      console.log("Selected Package:", selectedPackage);

      if (editMode) {
        if (!selectedPackage?.packageId) {
          console.error(
            "Không tìm thấy packageId trong selectedPackage:",
            selectedPackage
          );
          alert("Lỗi: Không tìm thấy ID gói để cập nhật");
          return;
        }
        console.log(
          "PackageId sẽ được sử dụng để update:",
          selectedPackage.packageId
        );
      }

      const packageData = {
        packageName: String(formData.packageName),
        description: String(formData.description),
        price: Number(formData.price),
        currency: "VND",
        durationMonths: Number(formData.durationMonths),
        maxChildrenAllowed: Number(formData.maxChildrenAllowed),
        trialPeriodDays: Number(formData.trialPeriodDays || 0),
        supportLevel: String(formData.supportLevel || ""),
        status: String(formData.status || ""),
      };

      console.log("Dữ liệu gửi đi từ component:", packageData);

      const result = editMode
        ? await packageApi.updatePackage(selectedPackage.packageId, packageData)
        : await packageApi.createPackage(packageData);

      console.log("Kết quả trả về:", result);

      if (result) {
        alert(editMode ? "Cập nhật thành công!" : "Thêm mới thành công!");
        fetchPackages();
        handleClose();
      }
    } catch (error) {
      console.error("Chi tiết lỗi:", error.response?.data);
      console.error("Status code:", error.response?.status);
      console.error("Lỗi khi xử lý gói:", error);
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleDelete = async (pkg) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói này?")) {
      try {
        const packageId =
          pkg.packageId || pkg.id || pkg.Id || pkg.membershipPackageId;
        if (!packageId) {
          alert("Không tìm thấy ID của gói để xóa");
          return;
        }
        await packageApi.deletePackage(packageId);
        fetchPackages();
      } catch (error) {
        console.error("Lỗi khi xóa gói:", error);
      }
    }
  };

  const renderTextField = (
    name,
    label,
    type = "text",
    multiline = false,
    rows = 1
  ) => (
    <TextField
      fullWidth
      margin="dense"
      name={name}
      label={label}
      type={type}
      multiline={multiline}
      rows={rows}
      value={formData[name]}
      onChange={handleInputChange}
      error={!!errors[name]}
      helperText={errors[name]}
    />
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Quản lý Gói Thành viên</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Thêm Gói Mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên Gói</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Thời hạn (tháng)</TableCell>
              <TableCell>Số trẻ tối đa</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map((pkg, index) => (
              <TableRow key={index}>
                <TableCell>{pkg.packageName}</TableCell>
                <TableCell>{pkg.description}</TableCell>
                <TableCell>{`${pkg.price} ${pkg.currency}`}</TableCell>
                <TableCell>{pkg.durationMonths}</TableCell>
                <TableCell>{pkg.maxChildrenAllowed}</TableCell>
                <TableCell>{pkg.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(pkg)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(pkg)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? "Chỉnh sửa Gói" : "Thêm Gói Mới"}</DialogTitle>
        <DialogContent>
          {renderTextField("packageName", "Tên Gói")}
          {renderTextField("description", "Mô tả", "text", true, 3)}
          {renderTextField("price", "Giá", "number")}
          {renderTextField("currency", "Loại tiền")}
          {renderTextField("durationMonths", "Thời hạn (tháng)", "number")}
          {renderTextField("maxChildrenAllowed", "Số trẻ tối đa", "number")}
          {renderTextField("trialPeriodDays", "Số ngày dùng thử", "number")}
          {renderTextField("supportLevel", "Mức độ hỗ trợ")}
          {renderTextField("status", "Trạng thái", "text")}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Packages;
