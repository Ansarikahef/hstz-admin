import React, { useState } from "react";
import {
  X,
  UserCog,
  CheckCircle2,
  Ban,
  ShieldAlert,
  MessageSquareText,
} from "lucide-react";
import "./UpdateUserStatusModal.css";

const statusOptions = [
  {
    value: "Active",
    label: "Active",
    icon: <CheckCircle2 size={18} />,
    color: "active",
  },
  {
    value: "Inactive",
    label: "Inactive",
    icon: <Ban size={18} />,
    color: "inactive",
  },
  {
    value: "Suspend",
    label: "Suspend",
    icon: <ShieldAlert size={18} />,
    color: "suspend",
  },
];

export default function UpdateUserStatusModal({
  isOpen,
  onClose,
  onSubmit,
  userName = "John Doe",
  isLoading = false,
}) {
  const [status, setStatus] = useState("Active");
  const [remark, setRemark] = useState("");

  const handleSubmit = () => {
    const payload = {
      status,
      remark,
    };

    console.log(payload);

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="statusModalOverlay">
      <div className="statusModalContainer">
        {/* Header */}
        <div className="statusModalHeader">
          <div className="statusHeaderLeft">
            <div className="statusIconBox">
              <UserCog size={22} />
            </div>

            <div>
              <h2>Update User Status</h2>
              <p>{userName}</p>
            </div>
          </div>

          <button className="closeBtn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="statusModalBody">
          <label className="sectionLabel">
            Select Status
          </label>

          <div className="statusGrid">
            {statusOptions.map((item) => (
              <div
                key={item.value}
                className={`statusCard ${
                  status === item.value ? "selected" : ""
                } ${item.color}`}
                onClick={() => setStatus(item.value)}
              >
                <div className="statusCardIcon">
                  {item.icon}
                </div>

                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Remark */}
          <div className="remarkSection">
            <label className="sectionLabel">
              <MessageSquareText size={16} />
              Remark
            </label>

            <textarea
              placeholder="Write remark here..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="statusModalFooter">
          <button className="cancelBtn" onClick={onClose}>
            Cancel
          </button>

          <button className="updateBtn" onClick={handleSubmit} disabled={isLoading}>
            <UserCog size={18} />
            {isLoading ? 'Updating...' :'Update Status'} 
          </button>
        </div>
      </div>
    </div>
  );
}