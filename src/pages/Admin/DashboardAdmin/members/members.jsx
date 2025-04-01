import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Typography,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Menu,
  Dropdown,
  Upload,
  Card,
  Divider,
} from "antd";
import axios from "axios";
import membershipApi from "../../../../services/memberShipApi";
import userAccountsApi from "../../../../services/userAccountsApi";
import doctorApi from "../../../../services/DoctorApi";
import {
  getAllMembers,
  updateMember,
  deleteMember,
  createMember,
} from "../../../../services/member";
import moment from "moment";
import "./members.css";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const Members = () => {
  // Common state
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);

  // Thêm hai state để quản lý việc tải lên ảnh
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  // State for UserAccounts
  const [userAccounts, setUserAccounts] = useState([]);
  const [userAccountModalVisible, setUserAccountModalVisible] = useState(false);
  const [userAccountForm] = Form.useForm();
  const [editingUserAccount, setEditingUserAccount] = useState(null);
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchText, setSearchText] = useState("");

  // State for Members
  const [members, setMembers] = useState([]);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [memberForm] = Form.useForm();
  const [editingMember, setEditingMember] = useState(null);
  const [memberSearchText, setMemberSearchText] = useState("");

  // State for MemberMemberships
  const [memberships, setMemberships] = useState([]);
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
  const [membershipForm] = Form.useForm();
  const [editingMembership, setEditingMembership] = useState(null);
  const [membershipPackages, setMembershipPackages] = useState([]);
  const [membershipSearchText, setMembershipSearchText] = useState("");

  // Thêm state để quản lý bước tạo doctor
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [doctorForm] = Form.useForm();

  // Thêm state để quản lý bước tạo member
  const [isCreatingMemberInfo, setIsCreatingMemberInfo] = useState(false);
  const [tempMemberData, setTempMemberData] = useState(null);
  const [memberInfoForm] = Form.useForm();

  // Thêm state cho Doctors
  const [doctors, setDoctors] = useState([]);
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorSearchText, setDoctorSearchText] = useState("");

  // Thêm state cho việc lọc status của doctors
  const [selectedDoctorStatus, setSelectedDoctorStatus] = useState("All");

  // Fetch data when component mounts and when tab changes
  useEffect(() => {
    if (activeTab === "1") {
      fetchUserAccounts();
    } else if (activeTab === "2") {
      fetchMembers();
    } else if (activeTab === "3") {
      fetchMemberships();
      fetchMembershipPackages();
    } else if (activeTab === "4") {
      fetchDoctors();
    }
  }, [activeTab]);

  // ===== USER ACCOUNTS FUNCTIONS =====
  const fetchUserAccounts = async () => {
    try {
      setLoading(true);
      const response = await userAccountsApi.getAll();

      if (Array.isArray(response.data)) {
        setUserAccounts(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setUserAccounts(response.data.data);
      } else {
        console.log("Data is not an array:", response.data);
        setUserAccounts([]);
      }
    } catch (error) {
      console.error("Error loading user accounts:", error);
      message.error("Could not load user accounts list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserAccount = () => {
    setEditingUserAccount(null);
    userAccountForm.resetFields();
    // Reset imageUrl nếu cần
    setImageUrl("");

    // Xác định role mặc định dựa trên filter hiện hành (selectedRole)
    const defaultRoleId =
      selectedRole === "Doctor" ? 2 : selectedRole === "Admin" ? 3 : 1; // Mặc định là 1 (Member) nếu không phải Doctor hay Admin

    userAccountForm.setFieldsValue({
      status: "Active",
      roleId: defaultRoleId,
      gender: "Male", // Giá trị mặc định cho giới tính
    });
    setUserAccountModalVisible(true);
  };

  const handleEditUserAccount = (record) => {
    setEditingUserAccount(record);
    // Cập nhật giá trị imageUrl
    setImageUrl(record.profilePicture || "");
    userAccountForm.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null,
      // Convert status string to number if needed
      status: record.status,
      // Cập nhật roleId dựa trên roleName
      roleId:
        record.roleName === "Admin" ? 3 : record.roleName === "Doctor" ? 2 : 1,
    });
    setUserAccountModalVisible(true);
  };

  const handleDeleteUserAccount = async (userId) => {
    try {
      setLoading(true);
      await userAccountsApi.delete(userId);
      message.success("User account deleted successfully");
      fetchUserAccounts();
    } catch (error) {
      console.error("Error deleting user account:", error);
      message.error("Could not delete user account");
    } finally {
      setLoading(false);
    }
  };

  // Chỉ giữ lại việc kiểm tra không cho chọn ngày trong tương lai
  const disabledDate = (current) => {
    // Không cho phép chọn ngày trong tương lai
    return current && current > moment().endOf("day");
  };

  const handleUserAccountSubmit = async (values) => {
    try {
      setLoading(true);

      const userAccountData = {
        username: values.username?.trim(),
        email: values.email?.trim(),
        phoneNumber: values.phoneNumber?.trim(),
        name: values.name?.trim(),
        gender: values.gender,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
        address: values.address?.trim(),
        password: values.password,
        status: 0,
        roleId: values.roleId,
      };

      console.log("Creating account with data:", userAccountData);

      const response = await userAccountsApi.create(userAccountData);
      console.log("Create account response:", response);

      if (response?.data?.data?.userId) {
        const userData = response.data.data;

        if (values.roleId === 2) {
          // Logic hiện tại cho Doctor
          setTempUserData({
            userId: userData.userId,
            name: userData.name,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
          });
          message.success(
            "Tạo tài khoản thành công. Vui lòng nhập thông tin bác sĩ"
          );
          setUserAccountModalVisible(false);
          setIsCreatingDoctor(true);
        } else if (values.roleId === 1) {
          // Logic mới cho Member
          setTempMemberData({
            userId: userData.userId,
            name: userData.name,
          });
          message.success(
            "Tạo tài khoản thành công. Vui lòng nhập thông tin member"
          );
          setUserAccountModalVisible(false);
          setIsCreatingMemberInfo(true);
        } else {
          message.success("Tạo tài khoản thành công");
          setUserAccountModalVisible(false);
        }
        fetchUserAccounts();
      } else {
        console.error("Response structure:", response);
        throw new Error("Không tìm thấy userId trong response");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      message.error(error.message || "Có lỗi xảy ra khi tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  // ===== MEMBERS FUNCTIONS =====
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getAllMembers();
      if (Array.isArray(response)) {
        setMembers(response);
      } else if (response && Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        console.log("Data is not an array:", response);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading members:", error);
      message.error("Could not load members list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    memberForm.resetFields();
    setMemberModalVisible(true);
  };

  const handleEditMember = (record) => {
    setEditingMember(record);
    memberForm.setFieldsValue({
      ...record,
    });
    setMemberModalVisible(true);
  };

  const handleDeleteMember = async (memberId) => {
    try {
      setLoading(true);
      await deleteMember(memberId);
      message.success("Member deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      message.error("Could not delete member");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingMember) {
        // Đảm bảo có userId khi cập nhật member
        const updateData = {
          ...values,
          userId: editingMember.userId, // Giữ lại userId từ member hiện tại
        };
        await updateMember(editingMember.memberId, updateData);
        message.success("Member updated successfully");
      } else {
        await createMember(values);
        message.success("Member created successfully");
      }
      setMemberModalVisible(false);
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      message.error("Could not save member");
    } finally {
      setLoading(false);
    }
  };

  // ===== MEMBERSHIPS FUNCTIONS =====
  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const response = await membershipApi.getAllMemberships();
      if (Array.isArray(response.data)) {
        setMemberships(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setMemberships(response.data.data);
      } else {
        console.log("Data is not an array:", response.data);
        setMemberships([]);
      }
    } catch (error) {
      console.error("Error loading memberships:", error);
      message.error("Could not load membership list");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipPackages = async () => {
    try {
      const response = await membershipApi.getAllPackages();
      if (Array.isArray(response.data)) {
        setMembershipPackages(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setMembershipPackages(response.data.data);
      } else {
        setMembershipPackages([]);
      }
    } catch (error) {
      console.error("Error loading membership packages:", error);
      message.error("Could not load package list");
    }
  };

  const handleAddMembership = () => {
    setEditingMembership(null);
    membershipForm.resetFields();
    setMembershipModalVisible(true);
  };

  const handleEditMembership = (record) => {
    setEditingMembership(record);
    membershipForm.setFieldsValue({
      ...record,
      startDate: record.startDate ? moment(record.startDate) : null,
      endDate: record.endDate ? moment(record.endDate) : null,
    });
    setMembershipModalVisible(true);
  };

  const handleDeleteMembership = async (memberMembershipId) => {
    try {
      setLoading(true);
      await membershipApi.deleteMembership(memberMembershipId);
      message.success("Membership deleted successfully");
      fetchMemberships();
    } catch (error) {
      console.error("Error deleting membership:", error);
      message.error("Could not delete membership");
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingMembership) {
        await membershipApi.updateMembership(
          editingMembership.memberMembershipId,
          values
        );
        message.success("Membership updated successfully");
      } else {
        await membershipApi.createMembership(values);
        message.success("Membership created successfully");
      }
      setMembershipModalVisible(false);
      fetchMemberships();
    } catch (error) {
      console.error("Error saving membership:", error);
      message.error("Could not save membership");
    } finally {
      setLoading(false);
    }
  };

  // Render status with appropriate color
  const renderStatus = (status) => {
    let className = "";

    if (status === "Active") {
      className = "MemberAdmin-status-active";
    } else if (status === "Inactive") {
      className = "MemberAdmin-status-inactive";
    } else {
      className = "MemberAdmin-status-pending";
    }

    return <span className={className}>{status}</span>;
  };

  // Thêm hàm render cho cột Role
  const renderRole = (role) => {
    let className = "";

    if (role === "Admin") {
      className = "MemberAdmin-role-admin";
    } else if (role === "Doctor") {
      className = "MemberAdmin-role-doctor";
    } else {
      className = "MemberAdmin-role-member";
    }

    return <span className={className}>{role}</span>;
  };

  // ===== COLUMNS DEFINITIONS =====
  const userAccountColumns = [
    {
      title: "No.",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 100,
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 150,
      ellipsis: true,
      className: "hide-on-mobile",
    },
    {
      title: "Profile Picture",
      dataIndex: "profilePicture",
      key: "profilePicture",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="Profile"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            N/A
          </div>
        ),
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      render: renderRole,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Actions",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUserAccount(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title="Are you sure you want to delete this account?"
            onConfirm={() => handleDeleteUserAccount(record.userId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="MemberAdmin-action-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const memberColumns = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Emergency Contact",
      dataIndex: "emergencyContact",
      key: "emergencyContact",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMember(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title="Are you sure you want to delete this member?"
            onConfirm={() => handleDeleteMember(record.memberId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="MemberAdmin-action-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const membershipColumns = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
    },
    {
      title: "Package Name",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Actions",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMembership(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title="Are you sure you want to delete this membership?"
            onConfirm={() => handleDeleteMembership(record.memberMembershipId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="MemberAdmin-action-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Thêm hàm xử lý thay đổi tìm kiếm
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Thêm hàm xử lý thay đổi tìm kiếm cho Members
  const handleMemberSearchChange = (e) => {
    setMemberSearchText(e.target.value);
  };

  // Thêm hàm xử lý thay đổi tìm kiếm cho Memberships
  const handleMembershipSearchChange = (e) => {
    setMembershipSearchText(e.target.value);
  };

  // Cập nhật hàm lọc dữ liệu user accounts để bao gồm cả tìm kiếm
  const filteredUserAccounts = userAccounts.filter((account) => {
    // Lọc theo vai trò
    const matchesRole =
      selectedRole === "All" || account.roleName === selectedRole;

    // Lọc theo chuỗi tìm kiếm (nếu có)
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      !searchText ||
      (account.name && account.name.toLowerCase().includes(searchLower)) ||
      (account.username &&
        account.username.toLowerCase().includes(searchLower)) ||
      (account.email && account.email.toLowerCase().includes(searchLower)) ||
      (account.phoneNumber &&
        account.phoneNumber.toLowerCase().includes(searchLower));

    return matchesRole && matchesSearch;
  });

  // Thêm hàm lọc dữ liệu members dựa trên tìm kiếm
  const filteredMembers = members.filter((member) => {
    const searchLower = memberSearchText.toLowerCase();

    // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
    if (!memberSearchText) return true;

    // Tìm theo tên thành viên
    if (
      member.memberName &&
      member.memberName.toLowerCase().includes(searchLower)
    ) {
      return true;
    }

    // Tìm trong thông tin liên hệ khẩn cấp
    if (member.emergencyContact) {
      const contactLower = member.emergencyContact.toLowerCase();

      // Kiểm tra xem chuỗi tìm kiếm có xuất hiện trong thông tin liên hệ không
      if (contactLower.includes(searchLower)) {
        return true;
      }

      // Tách thông tin liên hệ khẩn cấp để tìm kiếm chi tiết hơn
      // Giả định định dạng là "Tên - SĐT"
      const parts = contactLower.split("-");
      if (parts.length === 2) {
        const contactName = parts[0].trim();
        const contactPhone = parts[1].trim();

        // Tìm theo tên hoặc số điện thoại trong thông tin liên hệ
        if (
          contactName.includes(searchLower) ||
          contactPhone.includes(searchLower)
        ) {
          return true;
        }
      }
    }

    return false;
  });

  // Thêm hàm lọc dữ liệu memberships dựa trên tìm kiếm
  const filteredMemberships = memberships.filter((membership) => {
    const searchLower = membershipSearchText.toLowerCase();

    // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
    if (!membershipSearchText) return true;

    // Tìm theo tên thành viên
    if (
      membership.memberName &&
      membership.memberName.toLowerCase().includes(searchLower)
    ) {
      return true;
    }

    // Tìm theo tên gói thành viên
    if (
      membership.packageName &&
      membership.packageName.toLowerCase().includes(searchLower)
    ) {
      return true;
    }

    return false;
  });

  // Thêm hàm xử lý khi thay đổi role
  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  // Thêm hàm xử lý submit form thông tin member
  const handleMemberInfoSubmit = async (values) => {
    try {
      setLoading(true);

      if (!tempMemberData?.userId) {
        throw new Error("Không tìm thấy thông tin userId");
      }

      const memberData = {
        userId: tempMemberData.userId,
        emergencyContact: values.emergencyContact,
        notes: values.notes || "",
      };

      console.log("Creating member with data:", memberData);

      await createMember(memberData);
      message.success("Tạo thông tin member thành công");
      setIsCreatingMemberInfo(false);
      setTempMemberData(null);
      fetchMembers();
    } catch (error) {
      console.error("Error creating member:", error);
      message.error(
        error.response?.data?.message || "Không thể tạo thông tin member"
      );
    } finally {
      setLoading(false);
    }
  };

  // Thêm các hàm xử lý cho Doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getAllDoctors();
      if (Array.isArray(response.data)) {
        setDoctors(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setDoctors(response.data.data);
      } else {
        console.log("Data is not an array:", response.data);
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
      message.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    doctorForm.resetFields();
    setDoctorModalVisible(true);
  };

  const handleEditDoctor = (record) => {
    setEditingDoctor(record);
    doctorForm.setFieldsValue({
      ...record,
    });
    setDoctorModalVisible(true);
  };

  const handleDeleteDoctor = async (doctor) => {
    try {
      setLoading(true);
      await doctorApi.deleteDoctor(doctor.doctorId, doctor);
      message.success("Đã xóa bác sĩ thành công");
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      message.error("Không thể xóa bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (values) => {
    try {
      setLoading(true);
      if (editingDoctor) {
        await doctorApi.updateDoctor(editingDoctor.doctorId, {
          ...values,
          doctorId: editingDoctor.doctorId,
        });
        message.success("Cập nhật thông tin bác sĩ thành công");
      } else {
        // Xử lý thêm mới bác sĩ nếu cần
        const doctorData = {
          userId: tempUserData?.userId,
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          degree: values.degree,
          hospitalName: values.hospitalName,
          hospitalAddress: values.hospitalAddress,
          biography: values.biography || "",
          status: 0,
        };
        await doctorApi.createDoctor(doctorData);
        message.success("Tạo thông tin bác sĩ thành công");
      }
      setDoctorModalVisible(false);
      fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
      message.error("Không thể lưu thông tin bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSearchChange = (e) => {
    setDoctorSearchText(e.target.value);
  };

  // Thêm hàm xử lý thay đổi status
  const handleDoctorStatusChange = (status) => {
    setSelectedDoctorStatus(status);
  };

  // Cập nhật hàm lọc doctors
  const filteredDoctors = doctors.filter((doctor) => {
    // Lọc theo status
    const matchesStatus =
      selectedDoctorStatus === "All" || doctor.status === selectedDoctorStatus;

    // Lọc theo chuỗi tìm kiếm
    const searchLower = doctorSearchText.toLowerCase();
    const matchesSearch =
      !doctorSearchText ||
      (doctor.name && doctor.name.toLowerCase().includes(searchLower)) ||
      (doctor.email && doctor.email.toLowerCase().includes(searchLower)) ||
      (doctor.phoneNumber && doctor.phoneNumber.includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // Thêm cột cho bảng Doctors
  const doctorColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên Bác Sĩ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Học Vị",
      dataIndex: "degree",
      key: "degree",
    },
    {
      title: "Bệnh Viện",
      dataIndex: "hospitalName",
      key: "hospitalName",
    },
    {
      title: "Địa Chỉ",
      dataIndex: "hospitalAddress",
      key: "hospitalAddress",
      ellipsis: true,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatus(status),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditDoctor(record)}
            className="MemberAdmin-action-button"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bác sĩ này?"
            onConfirm={() => handleDeleteDoctor(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="MemberAdmin-action-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      className="MemberAdmin-container"
      style={{ backgroundColor: "#f5f5f5", padding: "24px" }}
    >
      <Card sx={{ mb: 3, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <div
          className="MemberAdmin-header"
          style={{ borderBottom: "none", marginBottom: 0 }}
        >
          <div>
            <Typography.Title
              level={5}
              style={{
                fontWeight: "bold",
                color: "#1976d2",
                margin: 0,
                fontSize: "25px",
              }}
            >
              Member Management
            </Typography.Title>
          </div>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="User Accounts" key="1">
            <div className="MemberAdmin-tab-header">
              <div className="MemberAdmin-tab-header-title">
                User Accounts List
              </div>
              <div className="MemberAdmin-user-accounts-actions">
                <div className="MemberAdmin-search-input-container">
                  <Input
                    placeholder="Search by name, username, email, phone"
                    value={searchText}
                    onChange={handleSearchChange}
                    allowClear
                    className="MemberAdmin-search-input"
                    prefix={<SearchOutlined />}
                  />
                </div>
                <div className="MemberAdmin-filter-action-container">
                  <div className="MemberAdmin-role-filter">
                    <Button
                      type={selectedRole === "All" ? "primary" : "default"}
                      onClick={() => handleRoleChange("All")}
                      className="MemberAdmin-filter-button"
                    >
                      All
                    </Button>
                    <Button
                      type={selectedRole === "Member" ? "primary" : "default"}
                      onClick={() => handleRoleChange("Member")}
                      className="MemberAdmin-filter-button"
                    >
                      Member
                    </Button>
                    <Button
                      type={selectedRole === "Doctor" ? "primary" : "default"}
                      onClick={() => handleRoleChange("Doctor")}
                      className="MemberAdmin-filter-button"
                    >
                      Doctor
                    </Button>
                    <Button
                      type={selectedRole === "Admin" ? "primary" : "default"}
                      onClick={() => handleRoleChange("Admin")}
                      className="MemberAdmin-filter-button"
                    >
                      Admin
                    </Button>
                  </div>
                  <Button
                    type="primary"
                    onClick={handleAddUserAccount}
                    icon={<PlusOutlined />}
                    className="MemberAdmin-add-account-button"
                  >
                    Add New Account
                  </Button>
                </div>
              </div>
            </div>
            <Table
              columns={userAccountColumns}
              dataSource={filteredUserAccounts}
              rowKey="userId"
              loading={loading}
              scroll={{ x: 1300 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} accounts`,
                showQuickJumper: true,
              }}
              size="middle"
              bordered
            />
          </TabPane>

          <TabPane tab="Members" key="2">
            <div className="MemberAdmin-tab-header">
              <div className="MemberAdmin-tab-header-title">Members List</div>
              <div className="MemberAdmin-user-accounts-actions">
                <div className="MemberAdmin-search-input-container">
                  <Input
                    placeholder="Search by member name or contact info"
                    value={memberSearchText}
                    onChange={handleMemberSearchChange}
                    allowClear
                    className="MemberAdmin-search-input"
                    prefix={<SearchOutlined />}
                  />
                </div>
                <div className="MemberAdmin-filter-action-container">
                  <Button
                    type="primary"
                    onClick={handleAddMember}
                    icon={<PlusOutlined />}
                    className="MemberAdmin-add-account-button"
                  >
                    Add New Member
                  </Button>
                </div>
              </div>
            </div>
            <Table
              columns={memberColumns}
              dataSource={filteredMembers}
              rowKey="memberId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} members`,
                showQuickJumper: true,
              }}
              size="middle"
              bordered
            />
          </TabPane>

          <TabPane tab="Memberships" key="3">
            <div className="MemberAdmin-tab-header">
              <div className="MemberAdmin-tab-header-title">
                Memberships List
              </div>
              <div className="MemberAdmin-user-accounts-actions">
                <div className="MemberAdmin-search-input-container">
                  <Input
                    placeholder="Search by member name or package name"
                    value={membershipSearchText}
                    onChange={handleMembershipSearchChange}
                    allowClear
                    className="MemberAdmin-search-input"
                    prefix={<SearchOutlined />}
                  />
                </div>
                <div className="MemberAdmin-filter-action-container">
                  <Button
                    type="primary"
                    onClick={handleAddMembership}
                    icon={<PlusOutlined />}
                    className="MemberAdmin-add-account-button"
                  >
                    Add New Membership
                  </Button>
                </div>
              </div>
            </div>
            <Table
              columns={membershipColumns}
              dataSource={filteredMemberships}
              rowKey="memberMembershipId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} memberships`,
                showQuickJumper: true,
              }}
              size="middle"
              bordered
            />
          </TabPane>

          <TabPane tab="Doctors" key="4">
            <div className="MemberAdmin-tab-header">
              <div className="MemberAdmin-tab-header-title">Doctors List</div>
              <div className="MemberAdmin-user-accounts-actions">
                <div className="MemberAdmin-search-input-container">
                  <Input
                    placeholder="Tìm kiếm theo tên, email, số điện thoại"
                    value={doctorSearchText}
                    onChange={handleDoctorSearchChange}
                    allowClear
                    className="MemberAdmin-search-input"
                    prefix={<SearchOutlined />}
                  />
                </div>
                <div className="MemberAdmin-filter-action-container">
                  <div className="MemberAdmin-role-filter">
                    <Button
                      type={
                        selectedDoctorStatus === "All" ? "primary" : "default"
                      }
                      onClick={() => handleDoctorStatusChange("All")}
                      className="MemberAdmin-filter-button"
                    >
                      Tất Cả
                    </Button>
                    <Button
                      type={
                        selectedDoctorStatus === "Active"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => handleDoctorStatusChange("Active")}
                      className="MemberAdmin-filter-button"
                    >
                      Đang Hoạt Động
                    </Button>
                    <Button
                      type={
                        selectedDoctorStatus === "Inactive"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => handleDoctorStatusChange("Inactive")}
                      className="MemberAdmin-filter-button"
                    >
                      Ngưng Hoạt Động
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Table
              columns={doctorColumns}
              dataSource={filteredDoctors}
              rowKey="doctorId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bác sĩ`,
                showQuickJumper: true,
              }}
              size="middle"
              bordered
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* User Account Modal */}
      <Modal
        title={editingUserAccount ? "Edit Account" : "Add New Account"}
        visible={userAccountModalVisible}
        onCancel={() => setUserAccountModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={userAccountForm}
          layout="vertical"
          onFinish={handleUserAccountSubmit}
        >
          <div className="MemberAdmin-form-row">
            <Form.Item
              name="username"
              label="Username"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              className="MemberAdmin-form-col"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="MemberAdmin-form-row">
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="name"
              label="Full Name"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="MemberAdmin-form-row">
            <Form.Item
              name="gender"
              label="Gender"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              className="MemberAdmin-form-col"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày sinh",
                },
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                disabledDate={disabledDate}
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>

          <Form.Item name="profilePicture" label="Profile Picture">
            <div className="MemberAdmin-profile-upload-container">
              <Upload
                name="profilePicture"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={async (file) => {
                  const isImage = /image\/(jpeg|png|jpg|gif)/.test(file.type);
                  if (!isImage) {
                    message.error("You can only upload image files!");
                    return Upload.LIST_IGNORE;
                  }

                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error("Image must be smaller than 2MB!");
                    return Upload.LIST_IGNORE;
                  }

                  // Bắt đầu trạng thái loading
                  setImageLoading(true);
                  try {
                    // Đoạn code upload ảnh thực tế (đã comment)
                    /* const result = await uploadImageToCloudinary(file);
                    if (result) {
                      setImageUrl(result.url);
                      userAccountForm.setFieldsValue({
                        profilePicture: result.url,
                      });
                    } */

                    // Giả lập việc tải ảnh (đọc ảnh bằng FileReader để preview)
                    const reader = new FileReader();
                    reader.onload = () => {
                      setImageUrl(reader.result);
                      userAccountForm.setFieldsValue({
                        profilePicture: reader.result,
                      });
                      setImageLoading(false);
                    };
                    reader.readAsDataURL(file);
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    message.error("Failed to upload image");
                    setImageLoading(false);
                  }
                  return false; // Chặn upload mặc định của antd
                }}
              >
                {imageUrl ? (
                  <div className="MemberAdmin-uploaded-image-preview">
                    <img
                      src={imageUrl}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    {imageLoading ? (
                      <div>Uploading...</div>
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </div>
                )}
              </Upload>
              {imageUrl && (
                <Button
                  onClick={() => {
                    setImageUrl("");
                    userAccountForm.setFieldsValue({ profilePicture: "" });
                  }}
                  size="small"
                  style={{ marginTop: 8 }}
                >
                  Remove
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="password"
            label={
              editingUserAccount
                ? "New Password (Leave blank to keep current)"
                : "Password"
            }
            rules={[
              {
                required: !editingUserAccount,
                message: "Please enter password",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <div className="MemberAdmin-form-row">
            <Form.Item
              name="status"
              label="Status"
              className="MemberAdmin-form-col"
              initialValue="Active"
            >
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="roleId"
              label="Role"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              initialValue={1}
            >
              <Select
                onChange={(value) => console.log("Role changed to:", value)}
              >
                <Option value={1}>Member</Option>
                <Option value={2}>Doctor</Option>
                <Option value={3}>Admin</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUserAccount ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setUserAccountModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Member Modal */}
      <Modal
        title={editingMember ? "Edit Member" : "Add New Member"}
        visible={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={memberForm} layout="vertical" onFinish={handleMemberSubmit}>
          <Form.Item
            name="memberName"
            label="Member Name"
            rules={[{ required: true, message: "Please enter member name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emergencyContact"
            label="Emergency Contact"
            rules={[
              { required: true, message: "Please enter emergency contact" },
            ]}
          >
            <Input placeholder="Name - Phone Number" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMember ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setMemberModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Membership Modal */}
      <Modal
        title={editingMembership ? "Edit Membership" : "Add New Membership"}
        visible={membershipModalVisible}
        onCancel={() => setMembershipModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={membershipForm}
          layout="vertical"
          onFinish={handleMembershipSubmit}
        >
          <Form.Item
            name="memberId"
            label="Member"
            rules={[{ required: true, message: "Vui lòng chọn thành viên" }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm thành viên"
              optionFilterProp="children"
              filterOption={(input, option) => {
                // Chuyển đổi tất cả về chữ thường để tìm kiếm không phân biệt hoa thường
                return (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              style={{ width: "100%" }}
            >
              {members.map((member) => (
                <Option key={member.memberId} value={member.memberId}>
                  {member.memberName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="packageId"
            label="Membership Package"
            rules={[
              { required: true, message: "Please select a membership package" },
            ]}
          >
            <Select>
              {membershipPackages.map((pkg) => (
                <Option key={pkg.packageId} value={pkg.packageId}>
                  {pkg.packageName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className="MemberAdmin-form-row">
            <Form.Item
              name="startDate"
              label="Start Date"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End Date"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <Form.Item name="status" label="Status" initialValue="Active">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMembership ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setMembershipModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Doctor Information Modal */}
      <Modal
        title="Nhập thông tin bác sĩ"
        visible={isCreatingDoctor}
        onCancel={() => {
          setIsCreatingDoctor(false);
          setTempUserData(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={doctorForm} layout="vertical" onFinish={handleDoctorSubmit}>
          <Form.Item
            name="degree"
            label="Học vị"
            rules={[{ required: true, message: "Vui lòng nhập học vị" }]}
          >
            <Input placeholder="Nhập học vị của bác sĩ" />
          </Form.Item>

          <Form.Item
            name="hospitalName"
            label="Tên bệnh viện"
            rules={[{ required: true, message: "Vui lòng nhập tên bệnh viện" }]}
          >
            <Input placeholder="Nhập tên bệnh viện" />
          </Form.Item>

          <Form.Item
            name="hospitalAddress"
            label="Địa chỉ bệnh viện"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ bệnh viện" },
            ]}
          >
            <Input placeholder="Nhập địa chỉ bệnh viện" />
          </Form.Item>

          <Form.Item name="biography" label="Tiểu sử">
            <TextArea rows={4} placeholder="Nhập tiểu sử bác sĩ" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo thông tin bác sĩ
              </Button>
              <Button
                onClick={() => {
                  setIsCreatingDoctor(false);
                  setTempUserData(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Member Information Modal */}
      <Modal
        title="Nhập thông tin member"
        visible={isCreatingMemberInfo}
        onCancel={() => {
          setIsCreatingMemberInfo(false);
          setTempMemberData(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={memberInfoForm}
          layout="vertical"
          onFinish={handleMemberInfoSubmit}
        >
          <Form.Item
            name="emergencyContact"
            label="Emergency Contact"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập thông tin liên hệ khẩn cấp",
              },
            ]}
          >
            <Input placeholder="Nhập thông tin liên hệ khẩn cấp" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} placeholder="Nhập ghi chú nếu có" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo thông tin member
              </Button>
              <Button
                onClick={() => {
                  setIsCreatingMemberInfo(false);
                  setTempMemberData(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Thêm Modal cho Doctor */}
      <Modal
        title={editingDoctor ? "Chỉnh Sửa Thông Tin Bác Sĩ" : "Thêm Bác Sĩ Mới"}
        visible={doctorModalVisible}
        onCancel={() => setDoctorModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={doctorForm} layout="vertical" onFinish={handleDoctorSubmit}>
          <div className="MemberAdmin-form-row">
            <Form.Item
              name="name"
              label="Tên Bác Sĩ"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Vui lòng nhập tên bác sĩ" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              className="MemberAdmin-form-col"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div className="MemberAdmin-form-row">
            <Form.Item
              name="phoneNumber"
              label="Số Điện Thoại"
              className="MemberAdmin-form-col"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="degree"
              label="Học Vị"
              className="MemberAdmin-form-col"
              rules={[{ required: true, message: "Vui lòng nhập học vị" }]}
            >
              <Input />
            </Form.Item>
          </div>

          <Form.Item
            name="hospitalName"
            label="Tên Bệnh Viện"
            rules={[{ required: true, message: "Vui lòng nhập tên bệnh viện" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="hospitalAddress"
            label="Địa Chỉ Bệnh Viện"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ bệnh viện" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="biography" label="Tiểu Sử">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingDoctor ? "Cập Nhật" : "Thêm Mới"}
              </Button>
              <Button onClick={() => setDoctorModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Members;
