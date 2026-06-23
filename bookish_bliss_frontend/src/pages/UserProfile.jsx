import React, { useState, useEffect } from "react";
import imgsrc from "../images/user2.png";
import { useNavigate } from "react-router-dom";
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation, 
  useChangePasswordMutation 
} from "../store/apiSlice";
import CustomDatePicker from "../components/CustomDatePicker";
import Swal from "sweetalert2";

const UserProfile = () => {
  const navigate = useNavigate();
  const { data: userData, isLoading, isError } = useGetProfileQuery(undefined, {
    skip: !localStorage.getItem("isLoggedIn"),
  });
  
  const [updateProfileMutation, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePasswordMutation, { isLoading: isChanging }] = useChangePasswordMutation();

  const [activeTab, setActiveTab] = useState("overview");
  
  const [editData, setEditData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    dob: "",
    gender: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({ id: null, street: "", city: "", state: "", zipCode: "", country: "", isDefault: false });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (userData) {
      setEditData({
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        phone: userData.phone || "",
        dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : "",
        gender: userData.gender || "",
      });
      setAddresses(userData.addresses || []);
    }
  }, [userData]);

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/");
    }
  }, [navigate]);

  if (!localStorage.getItem("isLoggedIn")) {
    return null;
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError || !userData) return <div>Error loading profile</div>;

  const setDob = (date) => {
    const d = new Date(date);
    let months;
    if (d.getMonth() <= 8) {
      months = "0" + (d.getMonth() + 1);
    } else {
      months = d.getMonth() + 1;
    }
    return `${d.getDate()}-${months}-${d.getFullYear()}`;
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const submitEditProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfileMutation(editData).unwrap();
      setActiveTab("overview");
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "danger", text: error.data?.message || "Failed to update profile." });
    }
  };

  const submitChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "danger", text: "New passwords do not match!" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "danger", text: "Password must be at least 6 characters long." });
      return;
    }
    try {
      await changePasswordMutation({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      setActiveTab("overview");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "danger", text: error.data?.message || "Failed to change password." });
    }
  };

  const handleGenderSelect = (val) => {
    setEditData(prev => ({ ...prev, gender: val }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submitAddress = async (e) => {
    e.preventDefault();
    let updatedAddresses = [...addresses];
    let newAddress = { ...addressForm };
    
    // If this is default, unset others
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    } else if (updatedAddresses.length === 0) {
      newAddress.isDefault = true; // First is always default
    }

    if (newAddress.id !== null) {
      // Remove id before saving since backend schema doesn't expect our arbitrary array index id
      const { id, _id, ...cleanAddress } = newAddress; 
      updatedAddresses[newAddress.id] = { ...updatedAddresses[newAddress.id], ...cleanAddress, isDefault: cleanAddress.isDefault };
    } else {
      const { id, _id, ...cleanAddress } = newAddress;
      updatedAddresses.push(cleanAddress);
    }

    try {
      const response = await updateProfileMutation({ addresses: updatedAddresses }).unwrap();
      setAddresses(response.user?.addresses || updatedAddresses);
      setIsAddressFormOpen(false);
      setMessage({ type: "success", text: "Addresses updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "danger", text: error.data?.message || "Failed to update addresses." });
    }
  };

  const deleteAddress = async (index) => {
    if (addresses[index].isDefault && addresses.length > 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Delete Default Address',
        text: 'Please set another address as your default before deleting this one.',
        confirmButtonColor: '#ff6200'
      });
      return;
    } else if (addresses.length === 1) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This is your only saved address. Are you sure you want to delete it?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff6200',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    const updatedAddresses = addresses.filter((_, i) => i !== index);
    if (addresses[index].isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }
    
    try {
      const response = await updateProfileMutation({ addresses: updatedAddresses }).unwrap();
      setAddresses(response.user?.addresses || updatedAddresses);
      setMessage({ type: "success", text: "Address deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to delete address." });
    }
  };

  const openAddressForm = (index = null) => {
    if (index !== null) {
      setAddressForm({ ...addresses[index], id: index });
    } else {
      setAddressForm({ id: null, street: "", city: "", state: "", zipCode: "", country: "", isDefault: false });
    }
    setIsAddressFormOpen(true);
  };

  return (
    <div className="container-fluid profile-dashboard">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="dashboard-sidebar">
            <div className="sidebar-avatar">
              <img src={imgsrc} alt="Profile Avatar" />
              <h4>{userData.firstname} {userData.lastname}</h4>
              <p>{userData.email}</p>
              <span className="badge bg-warning text-dark mt-2 text-uppercase" style={{ fontSize: "0.8rem", padding: "0.4em 0.8em" }}>{userData.role || "User"}</span>
            </div>
            <ul className="sidebar-nav">
              <li>
                <button 
                  className={activeTab === "overview" ? "active" : ""} 
                  onClick={() => setActiveTab("overview")}
                >
                  <i className="fa-solid fa-user"></i> Overview
                </button>
              </li>
              <li>
                <button 
                  className={activeTab === "edit" ? "active" : ""} 
                  onClick={() => setActiveTab("edit")}
                >
                  <i className="fa-solid fa-pen-to-square"></i> Edit Profile
                </button>
              </li>
              <li>
                <button 
                  className={activeTab === "addresses" ? "active" : ""} 
                  onClick={() => setActiveTab("addresses")}
                >
                  <i className="fa-solid fa-map-location-dot"></i> Addresses
                </button>
              </li>
              <li>
                <button 
                  className={activeTab === "security" ? "active" : ""} 
                  onClick={() => setActiveTab("security")}
                >
                  <i className="fa-solid fa-shield-halved"></i> Security
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9 dashboard-content">
          <div className="content-card">
            
            {message.text && (
              <div className={`alert alert-${message.type} mb-4`} role="alert">
                {message.text}
              </div>
            )}

            {activeTab === "overview" && (
              <>
                <div className="card-header">
                  <h2>Profile Overview</h2>
                </div>
                <div className="profile-details">
                  <div className="detail-row">
                    <div className="detail-label"><i className="fa-solid fa-signature"></i> Full Name</div>
                    <div className="detail-value">{userData.firstname} {userData.lastname}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label"><i className="fa-solid fa-envelope"></i> Email Address</div>
                    <div className="detail-value" style={{ textTransform: "none" }}>{userData.email}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label"><i className="fa-solid fa-phone"></i> Phone Number</div>
                    <div className="detail-value">{userData.phone || <span className="text-muted fst-italic">Not Provided</span>}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label"><i className="fa-solid fa-venus-mars"></i> Gender</div>
                    <div className="detail-value" style={{ textTransform: "capitalize" }}>{userData.gender ? userData.gender.replace(/_/g, " ") : <span className="text-muted fst-italic">Not Provided</span>}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label"><i className="fa-solid fa-calendar-days"></i> Date of Birth</div>
                    <div className="detail-value">{userData.dob ? setDob(userData.dob) : <span className="text-muted fst-italic">Not Provided</span>}</div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "edit" && (
              <>
                <div className="card-header">
                  <h2>Edit Profile</h2>
                </div>
                <form onSubmit={submitEditProfile}>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input type="text" className="form-control" name="firstname" value={editData.firstname} onChange={handleEditChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input type="text" className="form-control" name="lastname" value={editData.lastname} onChange={handleEditChange} required />
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label className="form-label">Phone Number <span className="text-muted" style={{fontSize: "0.85em"}}>(Optional)</span></label>
                      <input type="tel" className="form-control" name="phone" value={editData.phone} onChange={handleEditChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Gender <span className="text-muted" style={{fontSize: "0.85em"}}>(Optional)</span></label>
                      <div className="dropdown w-100">
                        <button
                          className="btn form-control dropdown-toggle text-start d-flex justify-content-between align-items-center"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{ backgroundColor: "#fcfcfc", border: "2px solid #ecf0f1", height: "100%" }}
                        >
                          {editData.gender 
                            ? editData.gender.charAt(0).toUpperCase() + editData.gender.slice(1).replace(/_/g, " ") 
                            : "Select..."}
                        </button>
                        <ul className="dropdown-menu w-100 border-0 custom-dropdown-menu">
                          <li><button type="button" className="dropdown-item" onClick={() => handleGenderSelect("male")}>Male</button></li>
                          <li><button type="button" className="dropdown-item" onClick={() => handleGenderSelect("female")}>Female</button></li>
                          <li><button type="button" className="dropdown-item" onClick={() => handleGenderSelect("other")}>Other</button></li>
                          <li><button type="button" className="dropdown-item" onClick={() => handleGenderSelect("prefer_not_to_say")}>Prefer not to say</button></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="row mb-5">
                    <div className="col-md-6">
                      <label className="form-label">Date of Birth <span className="text-muted" style={{fontSize: "0.85em"}}>(Optional)</span></label>
                      <CustomDatePicker 
                        selectedDate={editData.dob ? new Date(editData.dob) : null} 
                        onChange={(date) => {
                          const formattedDate = date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : "";
                          setEditData(prev => ({ ...prev, dob: formattedDate }));
                        }} 
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3">
                    <button type="button" className="btn btn-light" onClick={() => setActiveTab("overview")}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === "addresses" && (
              <>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h2>My Addresses</h2>
                  {!isAddressFormOpen && (
                    <button className="btn btn-primary btn-sm" onClick={() => openAddressForm()}>
                      <i className="fa-solid fa-plus"></i> Add New Address
                    </button>
                  )}
                </div>

                {!isAddressFormOpen ? (
                  <div className="address-list mt-4">
                    {addresses.length === 0 ? (
                      <div className="text-center text-muted p-5 bg-light rounded-3">
                        <i className="fa-solid fa-map-location-dot mb-3" style={{fontSize: "2rem"}}></i>
                        <p>You haven't saved any addresses yet.</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {addresses.map((addr, index) => (
                          <div className="col-md-6" key={index}>
                            <div className={`card h-100 border ${addr.isDefault ? 'border-primary' : ''}`}>
                              <div className="card-body">
                                {addr.isDefault && <span className="badge bg-primary mb-2">Default</span>}
                                <p className="mb-1"><strong>{addr.street}</strong></p>
                                <p className="mb-1">{addr.city}, {addr.state} {addr.zipCode}</p>
                                <p className="mb-3">{addr.country}</p>
                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-outline-secondary" onClick={() => openAddressForm(index)}>Edit</button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAddress(index)}>Delete</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={submitAddress} className="mt-4 bg-light p-4 rounded-3">
                    <h5 className="mb-4">{addressForm.id !== null ? "Edit Address" : "Add New Address"}</h5>
                    <div className="mb-3">
                      <label className="form-label">Street Address</label>
                      <input type="text" className="form-control" name="street" value={addressForm.street} onChange={handleAddressChange} required />
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">City</label>
                        <input type="text" className="form-control" name="city" value={addressForm.city} onChange={handleAddressChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">State/Province</label>
                        <input type="text" className="form-control" name="state" value={addressForm.state} onChange={handleAddressChange} required />
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label">Zip/Postal Code</label>
                        <input type="text" className="form-control" name="zipCode" value={addressForm.zipCode} onChange={handleAddressChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Country</label>
                        <input type="text" className="form-control" name="country" value={addressForm.country} onChange={handleAddressChange} required />
                      </div>
                    </div>
                    <div className="form-check mb-4">
                      <input className="form-check-input" type="checkbox" name="isDefault" id="defaultCheck" checked={addressForm.isDefault} onChange={handleAddressChange} />
                      <label className="form-check-label" htmlFor="defaultCheck">
                        Set as default shipping address
                      </label>
                    </div>
                    <div className="d-flex justify-content-end gap-3">
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setIsAddressFormOpen(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Address"}</button>
                    </div>
                  </form>
                )}
              </>
            )}

            {activeTab === "security" && (
              <>
                <div className="card-header d-flex align-items-center gap-3">
                  <div className="bg-light p-3 rounded-circle d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px" }}>
                    <i className="fa-solid fa-shield-halved text-primary" style={{ fontSize: "1.8rem" }}></i>
                  </div>
                  <div>
                    <h2 className="mb-1">Security Settings</h2>
                    <p className="text-muted mb-0">Update your password to keep your account secure.</p>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-lg-10 col-xl-8">
                    <form onSubmit={submitChangePassword} className="bg-light p-4 rounded-3 border">
                      <div className="mb-4">
                        <label className="form-label fw-bold">Current Password</label>
                        <input type="password" className="form-control" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required placeholder="Enter your current password" />
                      </div>
                      
                      <hr className="my-4 text-muted" />

                      <div className="row mb-5">
                        <div className="col-md-6 mb-4 mb-md-0">
                          <label className="form-label fw-bold">New Password</label>
                          <input type="password" className="form-control" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength="6" placeholder="Enter new password" />
                          <small className="text-muted d-block mt-2"><i className="fa-solid fa-circle-info me-1"></i>Must be at least 6 characters.</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Confirm New Password</label>
                          <input type="password" className="form-control" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required minLength="6" placeholder="Confirm new password" />
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-end gap-3">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => {
                          setActiveTab("overview");
                          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isChanging}>
                          {isChanging ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
