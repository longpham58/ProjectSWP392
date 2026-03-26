import React from "react";
import * as XLSX from "xlsx";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
};

export default function UserImportModal({ open, onClose, onImport }: Props) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleImport = () => {
    if (!selectedFile) return;
    onImport(selectedFile);
    setSelectedFile(null);
    onClose();
  };

  const handleDownloadTemplate = () => {
  const data = [
    {
      Username: "",
      Email: "",
      FullName: "",
      Phone: "",
      Department: "",
      Role: "EMPLOYEE",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  XLSX.writeFile(workbook, "user-import-template.xlsx");
};
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white w-[600px] rounded-lg p-6 space-y-5">

        <h2 className="text-lg font-semibold">Nhập người dùng</h2>

        {/* File format description */}
        <div className="border rounded-lg p-4 bg-gray-50 space-y-2">

          <div className="flex justify-between items-center">
            <p className="font-medium">Yêu cầu file</p>

            <button
              onClick={handleDownloadTemplate}
              className="text-sm border px-3 py-1 rounded hover:bg-gray-100"
            >
              Tải mẫu
            </button>
          </div>

          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>File CSV hoặc Excel (.csv, .xlsx, .xls)</li>
            <li>Kích thước tối đa: 10MB</li>
            <li>Các cột bắt buộc: Username, Email, FullName, Phone, Department, Role</li>
            <li>Giá trị Role: ADMIN, HR, TRAINER, EMPLOYEE</li>
          </ul>

        </div>

        {/* File input */}
        <div className="border-dashed border-2 rounded-lg p-10 text-center">

          {!selectedFile ? (
            <>
              <p className="mb-2">Chọn file Excel</p>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
            </>
          ) : (
            <div className="flex justify-between items-center">

              <span>{selectedFile.name}</span>

              <button
                className="text-red-500"
                onClick={() => setSelectedFile(null)}
              >
                Xóa
              </button>

            </div>
          )}

        </div>

        {/* Important notes */}
        <div className="border rounded-lg p-3 bg-yellow-50 text-sm">

          <p className="font-medium mb-1">Lưu ý quan trọng</p>

          <ul className="list-disc list-inside text-gray-700">
            <li>Email phải là duy nhất.</li>
            <li>Nếu email đã tồn tại, người dùng sẽ bị bỏ qua.</li>
          </ul>

        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Hủy
          </button>

          <button
            onClick={handleImport}
            disabled={!selectedFile}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Nhập
          </button>

        </div>

      </div>
    </div>
  );
}