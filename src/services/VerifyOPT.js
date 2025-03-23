import api from "../config/axios";

export const sendRegistrationOTP = async (email) => {
  try {
    const response = await api.post("Authentication/Register", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyRegistrationOTP = async (email, otp) => {
  try {
    const response = await api.post("Authentication/VerifyRegistrationOtp", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendForgetPasswordOTP = async (email) => {
  try {
    const response = await api.post("Authentication/ForgetPassword", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyResetPasswordOTP = async (email, otp) => {
  try {
    const response = await api.post("Authentication/VerifyResetPasswordOtp", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email, newPassword) => {
  try {
    const response = await api.post("Authentication/ResetPassword", {
      email,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendRegistrationEmailForOTP = async (email) => {
  try {
    const response = await api.post("Authentication/Register", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
