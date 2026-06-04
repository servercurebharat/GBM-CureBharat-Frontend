'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { publicAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck, User, Calendar, MapPin, Briefcase, FileText, Users } from 'lucide-react';

export default function CustomerKYCPage() {
  const router = useRouter();
  const { saleId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    maritalStatus: 'Single',
    occupation: '',
    pan: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    familyDetails: [
      { name: '', relation: '', dob: '', gender: 'Male' }
    ]
  });

  useEffect(() => {
    fetchSaleData();
  }, [saleId]);

  const fetchSaleData = async () => {
    try {
      const res = await publicAPI.getKycSale(saleId as string);
      if (res.data.success) {
        setSaleData(res.data.data.sale);
        setKycSubmitted(res.data.data.kycSubmitted);
        
        if (res.data.data.kycSubmitted) {
          toast.success('Your profile is already submitted!');
        } else {
          // Pre-fill some fields
          setFormData(prev => ({
            ...prev,
            fullName: res.data.data.sale.customerName || '',
            mobile: res.data.data.sale.customerMobile || '',
            email: res.data.data.sale.customerEmail || '',
          }));
        }
      }
    } catch (err: any) {
      toast.error('Could not load policy details. Invalid or expired link.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFamilyChange = (index: number, field: string, value: string) => {
    const updatedFamily = [...formData.familyDetails];
    updatedFamily[index] = { ...updatedFamily[index], [field]: value };
    setFormData(prev => ({ ...prev, familyDetails: updatedFamily }));
  };

  const addFamilyMember = () => {
    if (formData.familyDetails.length >= 4) {
      toast.error('You can add up to 4 family members.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      familyDetails: [...prev.familyDetails, { name: '', relation: '', dob: '', gender: 'Male' }]
    }));
  };

  const removeFamilyMember = (index: number) => {
    const updatedFamily = formData.familyDetails.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, familyDetails: updatedFamily }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await publicAPI.submitKyc(saleId as string, formData);
      if (res.data.success) {
        toast.success('Profile submitted successfully!');
        setKycSubmitted(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#49D2B5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!saleData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center p-8 bg-slate-800 rounded-xl shadow-xl border border-slate-700 max-w-md w-full">
          <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
          <p className="text-slate-400">This policy link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (kycSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="text-center p-10 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-lg w-full">
          <div className="w-20 h-20 bg-[#49D2B5]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-[#49D2B5]" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4 text-white">Profile Complete!</h2>
          <p className="text-slate-300 text-lg mb-8">
            Thank you, <span className="font-semibold text-[#49D2B5]">{saleData.customerName}</span>. Your details have been securely submitted.
          </p>
          <div className="bg-slate-900/50 p-6 rounded-xl text-left border border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Policy ID</p>
            <p className="text-lg font-mono text-white mb-4">{saleData.policyId}</p>
            <p className="text-sm text-slate-400 mb-1">Selected Plan</p>
            <p className="text-lg font-semibold text-[#49D2B5]">{saleData.plan?.name}</p>
          </div>
          <p className="text-slate-400 mt-8 text-sm">
            Your official Policy Document and Health Cards will be generated and emailed to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">Complete Your Profile</h1>
          <p className="text-lg text-slate-400">Policy: <span className="text-[#49D2B5] font-mono">{saleData.policyId}</span> | {saleData.plan?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Primary Applicant */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
              <User className="text-[#49D2B5]" />
              <h2 className="text-2xl font-bold text-white">Primary Applicant Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Date of Birth *</label>
                <input required type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Gender *</label>
                <select required name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Marital Status *</label>
                <select required name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]">
                  <option>Single</option>
                  <option>Married</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Occupation *</label>
                <input required type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">PAN Number *</label>
                <input required type="text" name="pan" value={formData.pan} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5] uppercase" maxLength={10} />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
              <MapPin className="text-[#49D2B5]" />
              <h2 className="text-2xl font-bold text-white">Contact & Address Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number *</label>
                <input required type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email ID *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Address Line 1 *</label>
                <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">City *</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">State *</label>
                  <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">PIN Code *</label>
                  <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#49D2B5]" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Family / Nominee */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Users className="text-[#49D2B5]" />
                <h2 className="text-2xl font-bold text-white">Family / Nominee Details</h2>
              </div>
              <button type="button" onClick={addFamilyMember} className="text-sm font-medium text-[#49D2B5] hover:text-[#3db29a] bg-[#49D2B5]/10 px-4 py-2 rounded-lg">
                + Add Member
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.familyDetails.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700 relative group">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                    <input required type="text" value={member.name} onChange={e => handleFamilyChange(index, 'name', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#49D2B5]" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Relation</label>
                    <input required type="text" value={member.relation} onChange={e => handleFamilyChange(index, 'relation', e.target.value)} placeholder="e.g. Spouse" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#49D2B5]" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">DOB</label>
                    <input required type="date" value={member.dob} onChange={e => handleFamilyChange(index, 'dob', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#49D2B5]" />
                  </div>
                  <div className="relative">
                    <label className="block text-xs text-slate-400 mb-1">Gender</label>
                    <select required value={member.gender} onChange={e => handleFamilyChange(index, 'gender', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#49D2B5]">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                    {formData.familyDetails.length > 1 && (
                      <button type="button" onClick={() => removeFamilyMember(index)} className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">* First member will be considered as the primary nominee.</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-[#49D2B5] to-[#3db29a] hover:from-[#3db29a] hover:to-[#2e8f7a] text-white font-bold py-4 px-10 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-70 text-lg"
            >
              {submitting ? 'Submitting securely...' : 'Submit Profile & Generate Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
