import authApi from "./authApi";

export const parseApiError = (error: any) => ({
  success: false,
  message: error?.response?.data?.message || "Une erreur est survenue"
});

export const apiHandler = async (method: string, url: string, data: any = null) => {
  try {
    const config = method === 'get' ? { params: data } : data;
    const response = await (authApi as any)[method](url, config);
    return { success: true, data: response.data };
  } catch (error) {
    return parseApiError(error);
  }
};
