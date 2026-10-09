import React from 'react';
import { MapPin, CheckSquare, Square, FileText } from 'lucide-react';

export const AddressForm = ({ data, onChange }) => {
  const addressDetails = data.addressDetails || {
    permanentAddress: { line1: '', line2: '', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', country: 'India', postalCode: '382330', policeStation: '', landmark: '' },
    currentAddress: { line1: '', line2: '', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', country: 'India', postalCode: '382330', policeStation: '', landmark: '', sameAsPermanent: true },
    addressProofType: 'Aadhaar Card',
    addressProofNumber: '',
    addressProofDocumentUrl: ''
  };

  const handleUpdatePermanent = (field, value) => {
    const perm = { ...addressDetails.permanentAddress, [field]: value };
    let curr = { ...addressDetails.currentAddress };
    if (addressDetails.currentAddress?.sameAsPermanent) {
      curr = { ...curr, [field]: value };
    }
    onChange('addressDetails', {
      ...addressDetails,
      permanentAddress: perm,
      currentAddress: curr
    });
    // Also sync flat currentAddress and permanentAddress for compatibility
    if (field === 'line1') {
      onChange('permanentAddress', value);
      if (addressDetails.currentAddress?.sameAsPermanent) onChange('currentAddress', value);
    }
    if (field === 'city') onChange('city', value);
    if (field === 'state') onChange('state', value);
    if (field === 'postalCode') onChange('postalCode', value);
  };

  const handleUpdateCurrent = (field, value) => {
    onChange('addressDetails', {
      ...addressDetails,
      currentAddress: { ...addressDetails.currentAddress, [field]: value }
    });
    if (field === 'line1') onChange('currentAddress', value);
  };

  const handleToggleSameAsPermanent = () => {
    const isSame = !addressDetails.currentAddress?.sameAsPermanent;
    let curr = isSame
      ? { ...addressDetails.permanentAddress, sameAsPermanent: true }
      : { ...addressDetails.currentAddress, sameAsPermanent: false };

    onChange('addressDetails', {
      ...addressDetails,
      currentAddress: curr
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
          <MapPin size={18} className="text-bjk-teal" />
          <span>Step 5: Residential & Address Verification Details</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Permanent domicile, current residential coordinates, police station jurisdiction, and address proof.
        </p>
      </div>

      {/* 1. Permanent Address */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-2">
          Permanent Address (As Per Govt Proof)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Line 1 *</label>
            <input
              type="text"
              required
              value={addressDetails.permanentAddress?.line1 || ''}
              onChange={(e) => handleUpdatePermanent('line1', e.target.value)}
              placeholder="House/Flat No., Building Name, Street"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Line 2</label>
            <input
              type="text"
              value={addressDetails.permanentAddress?.line2 || ''}
              onChange={(e) => handleUpdatePermanent('line2', e.target.value)}
              placeholder="Locality, Sector, Landmark"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">City *</label>
            <input
              type="text"
              value={addressDetails.permanentAddress?.city || 'Ahmedabad'}
              onChange={(e) => handleUpdatePermanent('city', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">District</label>
            <input
              type="text"
              value={addressDetails.permanentAddress?.district || 'Ahmedabad'}
              onChange={(e) => handleUpdatePermanent('district', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">State *</label>
            <input
              type="text"
              value={addressDetails.permanentAddress?.state || 'Gujarat'}
              onChange={(e) => handleUpdatePermanent('state', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">PIN Code *</label>
            <input
              type="text"
              value={addressDetails.permanentAddress?.postalCode || '382330'}
              onChange={(e) => handleUpdatePermanent('postalCode', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Current Address */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Current Residential Address
          </span>

          <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-bjk-teal">
            <input
              type="checkbox"
              checked={addressDetails.currentAddress?.sameAsPermanent ?? true}
              onChange={handleToggleSameAsPermanent}
              className="w-4 h-4 text-bjk-teal rounded border-slate-300"
            />
            <span>Same as Permanent Address</span>
          </label>
        </div>

        {(!addressDetails.currentAddress?.sameAsPermanent) && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={addressDetails.currentAddress?.line1 || ''}
                  onChange={(e) => handleUpdateCurrent('line1', e.target.value)}
                  placeholder="Current Flat No., Street, Area"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={addressDetails.currentAddress?.line2 || ''}
                  onChange={(e) => handleUpdateCurrent('line2', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={addressDetails.currentAddress?.city || ''}
                  onChange={(e) => handleUpdateCurrent('city', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={addressDetails.currentAddress?.state || ''}
                  onChange={(e) => handleUpdateCurrent('state', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={addressDetails.currentAddress?.postalCode || ''}
                  onChange={(e) => handleUpdateCurrent('postalCode', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddressForm;
