export interface PenaltyEmailData {
  driverName: string;
  licenseNo: string;
  plateNo?: string | null;
  violationCode: string;
  fine: number;
  points: number;
  location: string;
  occurredAt: string;
}

export function penaltyIssuedTemplate(data: PenaltyEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #111827;">
      <h2 style="color: #b91c1c;">Traffic Penalty Issued</h2>

      <p>Dear <strong>${data.driverName}</strong>,</p>

      <p>A traffic penalty has been issued under the Sri Lanka Road E-Penalty Management System (SLREPMS).</p>

      <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="border:1px solid #d1d5db; padding:8px;"><strong>License Number</strong></td>
          <td style="border:1px solid #d1d5db; padding:8px;">${data.licenseNo}</td>
        </tr>
        <tr>
          <td style="border:1px solid #d1d5db; padding:8px;"><strong>Vehicle Plate</strong></td>
          <td style="border:1px solid #d1d5db; padding:8px;">${data.plateNo ?? "Not provided"}</td>
        </tr>
        <tr>
          <td style="border:1px solid #d1d5db; padding:8px;"><strong>Violation Code</strong></td>
          <td style="border:1px solid #d1d5db; padding:8px;">${data.violationCode}</td>
        </tr>
        <tr>
          <td style="border:1px solid #d1d5db; padding:8px;"><strong>Fine Amount</strong></td>
          <td style="border:1px solid #d1d5db; padding:8px;">LKR ${data.fine}</td>
        </tr>
        <tr>
          <td style="border:1px solid #d1d5db; padding:8px;"><strong>Demerit Points</strong></td>
          <td style="border:1px solid #d1d5db; padding:8px;">${data.points}</td>
        </tr>
        <tr>
          <td style="border:1px solid #d1d5db; padding:8px;"><strong>Location</strong></td>
          <td style="border:1px solid #d1d5db; padding:8px;">${data.location}</td>
        </tr>
        <tr>
          <td style="border:1px solid #d1d5db; padding:8px;"><strong>Date / Time</strong></td>
          <td style="border:1px solid #d1d5db; padding:8px;">${data.occurredAt}</td>
        </tr>
      </table>

      <p style="margin-top: 16px;">
        Please log in to the SLREPMS driver portal to review and pay this penalty.
      </p>

      <p style="margin-top: 24px;">Regards,<br/><strong>SLREPMS</strong></p>
    </div>
  `;
}