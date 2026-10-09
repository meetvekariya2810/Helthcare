import QRCode from 'qrcode';
import jsPDF from 'jspdf';

/**
 * Format date of birth to match reference format: "26 AUGUST 1989"
 */
export const formatCardDOB = (dob) => {
  if (!dob) return 'NOT SPECIFIED';
  try {
    const d = new Date(dob);
    if (isNaN(d.getTime())) return String(dob).toUpperCase();
    const day = d.getDate();
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return String(dob).toUpperCase();
  }
};

/**
 * Safe field extraction with fallback
 */
export const getEmployeeCardFields = (employee) => {
  if (!employee) return {};
  const code = employee.employeeCode || employee.employeeId || 'BJK001';
  const name = (employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'EMPLOYEE NAME').toUpperCase();
  const designation = (
    employee.designationTitle || 
    (typeof employee.designation === 'string' ? employee.designation : employee.designation?.title) || 
    'OFFICER'
  ).toUpperCase();
  const department = (
    employee.departmentName || 
    (typeof employee.department === 'string' ? employee.department : employee.department?.name) || 
    'Healthcare Operations'
  );
  const blood = (employee.bloodGroup || 'O+').toUpperCase();
  const phone = employee.phone || employee.officialMobile || employee.personalMobile || '+91 99000 00000';
  const email = (employee.email || employee.workEmail || employee.personalEmail || `${code.toLowerCase()}@bjkhealthcare.com`).toLowerCase();
  const dob = formatCardDOB(employee.dateOfBirth);
  
  // Photo fallback logic:
  // For Krutika Parmar, default to extracted high-res photo if none in record
  let photo = employee.photo || employee.profilePhoto || employee.profilePhotoUrl || '';
  if (!photo && name.includes('KRUTIKA')) {
    photo = '/idcard-assets/krutika_photo_clean.png';
  }

  // Verification URL for QR code
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bjkhealthcare.com';
  const qrVerificationUrl = `${origin}/verify/employee/${code}`;

  return {
    code,
    name,
    designation,
    department,
    blood,
    phone,
    email,
    dob,
    photo,
    qrVerificationUrl
  };
};

/**
 * Generate QR code data URL (SVG or PNG data URL)
 */
export const generateQRCodeDataUrl = async (text, options = {}) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 1,
      color: {
        dark: '#003840',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H',
      ...options
    });
  } catch (err) {
    console.error('Error generating QR code data URL:', err);
    return '';
  }
};

/**
 * Draw ID Card Front onto an HTML5 Canvas at master resolution (1276 x 2026)
 */
export const drawCardFrontToCanvas = async (employee, canvas) => {
  const fields = getEmployeeCardFields(employee);
  const W = 1276;
  const H = 2026;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 1. Draw Master Blank Background
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    bgImg.onload = resolve;
    bgImg.onerror = resolve; // fallback graceful
    bgImg.src = '/idcard-assets/card_front_master_blank_web.png';
  });
  ctx.drawImage(bgImg, 0, 0, W, H);

  // 2. Photo Circle:
  // Center: x = 638, y = 742, Radius = 282 (Diameter = 564)
  const cx = 638;
  const cy = 742;
  const r = 282;

  if (fields.photo) {
    try {
      const pImg = new Image();
      pImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        pImg.onload = resolve;
        pImg.onerror = () => resolve(null);
        pImg.src = fields.photo;
      });

      if (pImg.complete && pImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Calculate aspect-ratio preserving cover
        const imgRatio = pImg.naturalWidth / pImg.naturalHeight;
        let dw, dh, dx, dy;
        const targetD = r * 2;
        if (imgRatio > 1) {
          dh = targetD;
          dw = targetD * imgRatio;
          dx = cx - dw / 2;
          dy = cy - r;
        } else {
          dw = targetD;
          dh = targetD / imgRatio;
          dx = cx - r;
          dy = cy - dh / 2;
        }
        ctx.drawImage(pImg, dx, dy, dw, dh);
        ctx.restore();
      } else {
        drawPhotoPlaceholder(ctx, cx, cy, r);
      }
    } catch (e) {
      drawPhotoPlaceholder(ctx, cx, cy, r);
    }
  } else {
    drawPhotoPlaceholder(ctx, cx, cy, r);
  }

  // 3. Employee Name
  // Reference: centered at x=638, y=1120 in 1276x2026 (~560 in 1013 scale)
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 68px "Montserrat", "Inter", "Segoe UI", sans-serif';
  
  // Scale font if name is very long to prevent overflow
  let nameFontSize = 68;
  if (fields.name.length > 22) {
    nameFontSize = Math.max(46, Math.floor(68 * (22 / fields.name.length)));
    ctx.font = `800 ${nameFontSize}px "Montserrat", "Inter", "Segoe UI", sans-serif`;
  }
  ctx.fillText(fields.name, cx, 1125);

  // 4. Designation
  // Reference: centered at x=638, y=1220 in 1276x2026 (~610 in 1013 scale)
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 46px "Montserrat", "Inter", "Segoe UI", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(fields.designation, cx, 1225);
  ctx.restore();

  // 5. Employee Details Key-Value Rows (on bottom textured paper)
  // Master PDF reference coords in 638x1013 scale:
  // Labels at x=82 -> 164px
  // Colons at x=234 -> 468px
  // Values at x=249 -> 498px
  // Rows:
  // y: 754 -> 1508px
  // y: 799 -> 1598px
  // y: 844 -> 1688px
  // y: 889 -> 1778px
  // y: 934 -> 1868px
  const rows = [
    { label: 'IN NO', val: fields.code },
    { label: 'BLOOD', val: fields.blood },
    { label: 'PHONE', val: fields.phone },
    { label: 'E-MAIL', val: fields.email },
    { label: 'DOB', val: fields.dob }
  ];

  const lx = 164;
  const colX = 468;
  const vx = 498;
  const startY = 1545;
  const stepY = 90;

  ctx.save();
  ctx.textBaseline = 'middle';

  rows.forEach((row, idx) => {
    const y = startY + idx * stepY;

    // Bold Label (#004851)
    ctx.fillStyle = '#004851';
    ctx.font = '800 48px "Montserrat", "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(row.label, lx, y);

    // Colon separator
    ctx.font = '800 48px "Montserrat", "Inter", "Segoe UI", sans-serif';
    ctx.fillText(':', colX, y);

    // Value (#004851, font-weight 600)
    ctx.font = '600 44px "Montserrat", "Inter", "Segoe UI", sans-serif';
    if (row.label === 'E-MAIL' && row.val.length > 28) {
      // Slightly reduce email size if extra long
      const emailSize = Math.max(32, Math.floor(44 * (28 / row.val.length)));
      ctx.font = `600 ${emailSize}px "Montserrat", "Inter", "Segoe UI", sans-serif`;
    }
    ctx.fillText(row.val, vx, y);
  });
  ctx.restore();

  return canvas;
};

/**
 * Fallback circular placeholder when photo is missing
 */
function drawPhotoPlaceholder(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
  ctx.fillStyle = '#013840';
  ctx.fill();

  // Subtle camera/user silhouette
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(cx, cy - 30, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy + 130, 110, Math.PI, 0, true);
  ctx.fill();

  // "PHOTO NOT AVAILABLE" text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '700 24px "Montserrat", "Inter", sans-serif';
  ctx.fillText('PHOTO NOT AVAILABLE', cx, cy + 50);
  ctx.restore();
}

/**
 * Draw ID Card Back onto an HTML5 Canvas at master resolution (1276 x 2026)
 */
export const drawCardBackToCanvas = async (employee, canvas) => {
  const fields = getEmployeeCardFields(employee);
  const W = 1276;
  const H = 2026;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 1. Draw Master Blank Back Background
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  await new Promise((resolve) => {
    bgImg.onload = resolve;
    bgImg.onerror = resolve;
    bgImg.src = '/idcard-assets/card_back_master_blank_web.png';
  });
  ctx.drawImage(bgImg, 0, 0, W, H);

  // 2. Generate and draw Dynamic QR Code inside the framed box:
  // Master PDF rect for QR box in 638x1013 scale:
  // Rect(220, 677, 417, 874) -> width = 197, height = 197
  // In 2x scale:
  // x = 440, y = 1354, width = 394, height = 394
  // The interior white area has 4px padding: x = 444, y = 1358, size = 386
  const qrDataUrl = await generateQRCodeDataUrl(fields.qrVerificationUrl);
  if (qrDataUrl) {
    const qrImg = new Image();
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.onerror = resolve;
      qrImg.src = qrDataUrl;
    });

    // Draw QR code with a neat 12px margin inside the framed white box
    const qx = 448;
    const qy = 1362;
    const qSize = 378;
    ctx.drawImage(qrImg, qx, qy, qSize, qSize);
  }

  return canvas;
};

/**
 * Generate 2-Page Official PDF for an Employee:
 * Page 1: ID Card Front (exact reference)
 * Page 2: ID Card Back (exact reference)
 */
export const generateEmployeeIdCardPdf = async (employee) => {
  const fields = getEmployeeCardFields(employee);
  
  // Create off-screen canvases
  const frontCanvas = document.createElement('canvas');
  const backCanvas = document.createElement('canvas');

  await drawCardFrontToCanvas(employee, frontCanvas);
  await drawCardBackToCanvas(employee, backCanvas);

  const frontDataUrl = frontCanvas.toDataURL('image/png', 1.0);
  const backDataUrl = backCanvas.toDataURL('image/png', 1.0);

  // Card dimensions in points (matching reference PDF: 638 x 1013 pt)
  // Standard ID-1 card format or reference 638 x 1013
  const pdfWidth = 638;
  const pdfHeight = 1013;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pdfWidth, pdfHeight]
  });

  // Page 1: Front
  pdf.addImage(frontDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  // Page 2: Back
  pdf.addPage([pdfWidth, pdfHeight], 'portrait');
  pdf.addImage(backDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  // Safe filename
  const cleanName = fields.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${cleanName}_ID_Card.pdf`;
  pdf.save(fileName);

  return { success: true, fileName };
};

/**
 * Download a single card image (PNG)
 */
export const downloadSingleCardImage = async (side, employee) => {
  const fields = getEmployeeCardFields(employee);
  const canvas = document.createElement('canvas');

  if (side === 'front') {
    await drawCardFrontToCanvas(employee, canvas);
  } else {
    await drawCardBackToCanvas(employee, canvas);
  }

  const cleanName = fields.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${cleanName}_ID_Card_${side.toUpperCase()}.png`;

  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate Bulk ID Card PDF for multiple employees
 */
export const generateBulkIdCardPdf = async (employees, onProgress) => {
  if (!employees || employees.length === 0) return;

  const pdfWidth = 638;
  const pdfHeight = 1013;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pdfWidth, pdfHeight]
  });

  const frontCanvas = document.createElement('canvas');
  const backCanvas = document.createElement('canvas');

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    if (onProgress) {
      onProgress(i + 1, employees.length, emp.fullName);
    }

    if (i > 0) {
      pdf.addPage([pdfWidth, pdfHeight], 'portrait');
    }

    // Front
    await drawCardFrontToCanvas(emp, frontCanvas);
    pdf.addImage(frontCanvas.toDataURL('image/png', 0.95), 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // Back
    pdf.addPage([pdfWidth, pdfHeight], 'portrait');
    await drawCardBackToCanvas(emp, backCanvas);
    pdf.addImage(backCanvas.toDataURL('image/png', 0.95), 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `BJK_All_Employee_ID_Cards_${dateStr}.pdf`;
  pdf.save(fileName);

  return { success: true, fileName };
};

/**
 * Open print window for employee ID card
 */
export const printEmployeeIdCard = async (employee) => {
  const frontCanvas = document.createElement('canvas');
  const backCanvas = document.createElement('canvas');

  await drawCardFrontToCanvas(employee, frontCanvas);
  await drawCardBackToCanvas(employee, backCanvas);

  const frontUri = frontCanvas.toDataURL('image/png');
  const backUri = backCanvas.toDataURL('image/png');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print ID card');
    return;
  }

  const fields = getEmployeeCardFields(employee);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ID Card - ${fields.name}</title>
        <style>
          @page {
            size: 54mm 86mm; /* Standard CR-80 PVC Card Dimensions */
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: sans-serif;
          }
          .card-page {
            width: 54mm;
            height: 86mm;
            page-break-after: always;
            page-break-inside: avoid;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .card-page:last-child {
            page-break-after: auto;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: fill;
            display: block;
          }
          @media screen {
            body {
              background: #f1f5f9;
              padding: 20px;
              gap: 20px;
            }
            .card-page {
              width: 340px;
              height: 540px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              border-radius: 12px;
              overflow: hidden;
            }
            .print-btn {
              padding: 10px 24px;
              background: #00747e;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 15px;
              font-weight: bold;
              cursor: pointer;
              margin-bottom: 10px;
            }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print ID Card (CR80 PVC Format)</button>
        <div class="card-page">
          <img src="${frontUri}" alt="Front" />
        </div>
        <div class="card-page">
          <img src="${backUri}" alt="Back" />
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
