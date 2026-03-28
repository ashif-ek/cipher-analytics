import React from 'react';

export const LegalContent = ({ type }) => {
  const content = {
    terms: (
      <div className="space-y-6 font-sans text-sm text-slate-600 leading-relaxed">
        <section>
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">1. Identity & Access</h4>
          <p>
            Cipher Analytics provides advanced data processing and cryptographic analysis tools. 
            By accessing our platform, you agree to provide accurate identification and maintain 
            the security of your authentication tokens.
          </p>
        </section>
        <section>
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">2. Industrial Standards</h4>
          <p>
            Users must adhere to established engineering protocols and research ethics. Unauthorized 
            access to datasets or attempts to bypass security headers will result in immediate 
            account suspension.
          </p>
        </section>
        <section>
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">3. Data Integrity</h4>
          <p>
            We guarantee 99.9% uptime for session synchronization but are not liable for local 
            hardware failures that impact real-time data ingestion.
          </p>
        </section>
        <div className="pt-4 border-t border-slate-100 font-mono text-[10px] uppercase">
          Document Ref: CA-TOS-2026-REV-1
        </div>
      </div>
    ),
    privacy: (
      <div className="space-y-6 font-sans text-sm text-slate-600 leading-relaxed">
        <section>
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">1. Telemetry & Logs</h4>
          <p>
            We collect granular audit logs for security traceability. This includes IP addresses, 
            request signatures, and browser fingerprinting to prevent unauthorized session hijacking.
          </p>
        </section>
        <section>
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">2. Cryptographic Privacy</h4>
          <p>
            All sensitive data is encrypted at rest using industry-standard protocols. We utilize 
            end-to-end encryption for all dataset transfers between the client and research nodes.
          </p>
        </section>
        <section>
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">3. Policy Revisions</h4>
          <p>
            Privacy updates are synced automatically. Continued use of the platform after updates 
            to the `SECURITY.md` or this policy constitutes acknowledgment of revised protocols.
          </p>
        </section>
        <div className="pt-4 border-t border-slate-100 font-mono text-[10px] uppercase">
          Document Ref: CA-PP-2026-REV-2
        </div>
      </div>
    )
  };

  return content[type] || null;
};
