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
      tempErrors.packageName = "Please enter package name";
      isValid = false;
    }

    if (!formData.description.trim()) {
      tempErrors.description = "Please enter description";
      isValid = false;
    }

    if (!formData.price) {
      tempErrors.price = "Please enter price";
      isValid = false;
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      tempErrors.price = "Price must be a positive number";
      isValid = false;
    }

    if (!formData.durationMonths) {
      tempErrors.durationMonths = "Please enter duration";
      isValid = false;
    } else if (
      isNaN(formData.durationMonths) ||
      Number(formData.durationMonths) <= 0
    ) {
      tempErrors.durationMonths = "Duration must be a positive number";
      isValid = false;
    }

    if (!formData.maxChildrenAllowed) {
      tempErrors.maxChildrenAllowed = "Please enter max number of children";
      isValid = false;
    } else if (
      isNaN(formData.maxChildrenAllowed) ||
      Number(formData.maxChildrenAllowed) <= 0
    ) {
      tempErrors.maxChildrenAllowed =
        "Max number of children must be a positive number";
      isValid = false;
    }

    return { isValid, tempErrors };
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
        <Typography variant="h4">Membership Package Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          ADD NEW PACKAGE
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="70px">No.</TableCell>
              <TableCell>Package Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Duration (Months)</TableCell>
              <TableCell>Max Children Allowed</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map((pkg, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{pkg.packageName}</TableCell>
                <TableCell>{pkg.description}</TableCell>
                <TableCell>{`${pkg.price} ${pkg.currency}`}</TableCell>
                <TableCell>{pkg.durationMonths}</TableCell>
                <TableCell>{pkg.maxChildrenAllowed}</TableCell>
                <TableCell>{pkg.status}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpen(pkg)}
                      sx={{
                        backgroundColor: "#00E5BE",
                        color: "white",
                        borderRadius: "8px",
                        padding: "8px",
                        "&:hover": {
                          backgroundColor: "#00D1AD",
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(pkg)}
                      sx={{
                        backgroundColor: "#FF5252",
                        color: "white",
                        borderRadius: "8px",
                        padding: "8px",
                        "&:hover": {
                          backgroundColor: "#FF1744",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editMode ? "Edit Package" : "Add New Package"}
        </DialogTitle>
        <DialogContent>
          {renderTextField("packageName", "Package Name")}
          {renderTextField("description", "Description", "text", true, 3)}
          {renderTextField("price", "Price", "number")}
          {renderTextField("currency", "Currency")}
          {renderTextField("durationMonths", "Duration (Months)", "number")}
          {renderTextField(
            "maxChildrenAllowed",
            "Max Children Allowed",
            "number"
          )}
          {renderTextField("trialPeriodDays", "Trial Period (Days)", "number")}
          {renderTextField("supportLevel", "Support Level")}
          {renderTextField("status", "Status", "text")}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Packages;
