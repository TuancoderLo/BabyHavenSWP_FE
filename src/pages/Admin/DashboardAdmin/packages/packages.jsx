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
  Card,
  CardContent,
  Grid,
  Divider,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import packageApi from "../../../../services/packageApi";
import "./ManagePackage.css";

function Packages() {
  const [packages, setPackages] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
      console.log("Data from API:", response.data);
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const handleOpen = (pkg = null) => {
    if (pkg) {
      console.log("Selected package for edit:", pkg);
      const packageId =
        pkg.packageId || pkg.id || pkg.Id || pkg.membershipPackageId;
      if (!packageId) {
        console.error("Package ID not found:", pkg);
        alert("Error: Package ID not found");
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

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      console.log("FormData before sending:", formData);
      console.log("Selected Package:", selectedPackage);

      if (editMode) {
        if (!selectedPackage?.packageId) {
          console.error(
            "PackageId not found in selectedPackage:",
            selectedPackage
          );
          alert("Error: Package ID not found for update");
          return;
        }
        console.log(
          "PackageId to be used for update:",
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

      console.log("Data to be sent from component:", packageData);

      const result = editMode
        ? await packageApi.updatePackage(selectedPackage.packageId, packageData)
        : await packageApi.createPackage(packageData);

      console.log("Result from API:", result);

      if (result) {
        alert(editMode ? "Update successful!" : "Package added successfully!");
        fetchPackages();
        handleClose();
      }
    } catch (error) {
      console.error("Detailed error:", error.response?.data);
      console.error("Status code:", error.response?.status);
      console.error("Error processing package:", error);
      alert("An error occurred: " + error.message);
    }
  };

  const handleDelete = async (pkg) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        const packageId =
          pkg.packageId || pkg.id || pkg.Id || pkg.membershipPackageId;
        if (!packageId) {
          alert("Could not find package ID");
          return;
        }
        await packageApi.deletePackage(packageId);
        fetchPackages();
      } catch (error) {
        console.error("Error deleting package:", error);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Card sx={{ mb: 3, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                Membership Package Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage membership service packages for the system
              </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search by package name..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1976d2",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={3}
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                sx={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                Add New Package
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ overflow: "auto" }}>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: "none",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: "#f5f7fa" }}>
                  <TableRow>
                    <TableCell width="60px" sx={{ fontWeight: "bold" }}>
                      No.
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Package Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Duration (Months)
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Max Children
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", width: "120px" }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPackages.length > 0 ? (
                    filteredPackages.map((pkg, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                          "&:hover": { backgroundColor: "#f1f8ff" },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: "medium" }}>
                          {pkg.packageName}
                        </TableCell>
                        <TableCell>
                          {pkg.description.length > 50
                            ? `${pkg.description.substring(0, 50)}...`
                            : pkg.description}
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "medium", color: "#1976d2" }}
                        >{`${pkg.price.toLocaleString()} ${
                          pkg.currency
                        }`}</TableCell>
                        <TableCell>{pkg.durationMonths}</TableCell>
                        <TableCell>{pkg.maxChildrenAllowed}</TableCell>
                        <TableCell>
                          <Chip
                            label={pkg.status}
                            size="small"
                            color={
                              pkg.status === "ACTIVE" ? "success" : "default"
                            }
                            sx={{ borderRadius: "4px" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={() => handleOpen(pkg)}
                              size="small"
                              sx={{
                                backgroundColor: "#e3f2fd",
                                "&:hover": { backgroundColor: "#bbdefb" },
                              }}
                            >
                              <EditIcon fontSize="small" color="primary" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(pkg)}
                              size="small"
                              sx={{
                                backgroundColor: "#ffebee",
                                "&:hover": { backgroundColor: "#ffcdd2" },
                              }}
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No packages found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {filteredPackages.length > 0 && (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              Showing {filteredPackages.length} out of {packages.length}{" "}
              packages
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "#f5f7fa",
            py: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {editMode ? "Edit Package" : "Add New Package"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {renderTextField("packageName", "Package Name")}
            </Grid>
            <Grid item xs={12}>
              {renderTextField("description", "Description", "text", true, 3)}
            </Grid>
            <Grid item xs={6}>
              {renderTextField("price", "Price", "number")}
            </Grid>
            <Grid item xs={6}>
              {renderTextField("currency", "Currency")}
            </Grid>
            <Grid item xs={6}>
              {renderTextField("durationMonths", "Duration (Months)", "number")}
            </Grid>
            <Grid item xs={6}>
              {renderTextField("maxChildrenAllowed", "Max Children", "number")}
            </Grid>
            <Grid item xs={6}>
              {renderTextField(
                "trialPeriodDays",
                "Trial Period (Days)",
                "number"
              )}
            </Grid>
            <Grid item xs={6}>
              {renderTextField("supportLevel", "Support Level")}
            </Grid>
            <Grid item xs={12}>
              {renderTextField("status", "Status")}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: "8px" }}
          >
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Packages;
