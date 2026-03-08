import { create } from "zustand";
import { certificateApi, Certificate } from "../api/certificate.api";

interface CertificateState {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;

  fetchCertificates: (userId: number) => Promise<void>;
}

export const useCertificateStore = create<CertificateState>((set) => ({
  certificates: [],
  loading: false,
  error: null,

  fetchCertificates: async (userId: number) => {
    try {
      set({ loading: true, error: null });

      const res = await certificateApi.getByUser(userId);

      set({
        certificates: res.data.data,
        loading: false
      });
    } catch (err: any) {
      set({
        error: err.message || "Failed to load certificates",
        loading: false
      });
    }
  }
}));