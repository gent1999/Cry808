import React from "react";
import Footer from "../components/Footer";

export default function TermsOfUse() {
  const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Terms of Use
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <p className="text-white/70 mt-4">Effective Date: {effectiveDate}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 leading-relaxed mb-4">
                  Welcome to Cry808. These Terms of Use ("Terms") govern your access to and use of the Cry808 website
                  (Cry808.com) and all related services, content, and features (collectively, the "Service"). By accessing
                  or using the Service, you agree to be bound by these Terms.
                </p>
                <p className="text-white/80 leading-relaxed">
                  If you do not agree to these Terms, please do not use the Service. We reserve the right to modify these
                  Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
                </p>
              </div>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 leading-relaxed">
                  By accessing or using Cry808, you acknowledge that you have read, understood, and agree to be bound by
                  these Terms of Use and our Privacy Policy. If you are using the Service on behalf of an organization,
                  you agree to these Terms on behalf of that organization and represent that you have the authority to do so.
                </p>
              </div>
            </section>

            {/* Use of Service */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">2. Use of Service</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">You agree to use the Service only for lawful purposes. You agree NOT to:</p>
                <ul className="space-y-2 text-white/70 ml-4">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Violate any local, state, national, or international law</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Harass, threaten, or intimidate other users</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Interfere with or disrupt the Service or servers or networks connected to the Service</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Use any automated system, including "robots," "spiders," or "scrapers" to access the Service</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Transmit any viruses, malware, or other malicious code</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">3. Intellectual Property Rights</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  All content on Cry808, including but not limited to text, graphics, logos, images, audio clips, video,
                  data compilations, and software, is the property of Cry808 or its content suppliers and is protected by
                  United States and international copyright laws.
                </p>
                <p className="text-white/80 mb-4">
                  The compilation of all content on this site is the exclusive property of Cry808 and is protected by U.S.
                  and international copyright laws. All software used on this site is the property of Cry808 or its software
                  suppliers and is protected by United States and international copyright laws.
                </p>
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4 mt-4">
                  <p className="text-white/90">
                    <strong>Trademarks:</strong> "Cry808" and the Cry808 logo are trademarks. You may not use our trademarks,
                    trade dress, or design aesthetic without our prior written consent.
                  </p>
                </div>
              </div>
            </section>

            {/* User Content */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">4. User-Submitted Content</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  By submitting content to Cry808 (including music submissions, comments, or other materials), you grant
                  Cry808 a worldwide, non-exclusive, royalty-free, perpetual, irrevocable license to use, reproduce, modify,
                  adapt, publish, translate, distribute, and display such content in any media.
                </p>
                <p className="text-white/80 mb-4">
                  You represent and warrant that:
                </p>
                <ul className="space-y-2 text-white/70 ml-4">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>You own or have the necessary rights to the content you submit</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Your content does not violate any third-party rights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">•</span>
                    <span>Your content does not contain any defamatory, obscene, or illegal material</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Third-Party Links */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Links and Content</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  The Service may contain links to third-party websites or services (including Spotify, YouTube, and other
                  platforms). Cry808 is not responsible for the content, accuracy, or practices of these third-party sites.
                  Your use of third-party sites is at your own risk and subject to the terms and conditions of those sites.
                </p>
              </div>
            </section>

            {/* Disclaimer of Warranties */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimer of Warranties</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER
                  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p className="text-white/80">
                  Cry808 does not warrant that the Service will be uninterrupted, secure, or error-free, or that any defects
                  will be corrected. We do not warrant or make any representations regarding the use or results of the content
                  in terms of accuracy, reliability, or otherwise.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, CRY808 SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                  CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
                  INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                </p>
                <p className="text-white/70 text-sm">
                  Some states do not allow the exclusion or limitation of certain damages, so some of the above limitations
                  may not apply to you.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">8. Indemnification</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  You agree to indemnify, defend, and hold harmless Cry808, its officers, directors, employees, agents, and
                  third parties, from and against all claims, losses, expenses, damages, and costs, including reasonable
                  attorneys' fees, resulting from any violation of these Terms or any activity related to your account.
                </p>
              </div>
            </section>

            {/* Electronic Communications */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">9. Electronic Communications</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  By using the Service, you consent to receive electronic communications from Cry808. These communications
                  may include notices about your account, newsletter subscriptions, and other information concerning or
                  related to the Service. You agree that any notices, agreements, disclosures, or other communications that
                  we send to you electronically will satisfy any legal communication requirements, including that such
                  communications be in writing.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law and Jurisdiction</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  These Terms shall be governed by and construed in accordance with the laws of the United States and the
                  State of New York, without regard to its conflict of law provisions. You agree to submit to the personal
                  and exclusive jurisdiction of the courts located within New York for the resolution of any disputes.
                </p>
              </div>
            </section>

            {/* Severability */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">11. Severability</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be
                  deemed severable from these Terms and shall not affect the validity and enforceability of any remaining
                  provisions.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms of Use</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by
                  posting the new Terms on this page and updating the "Effective Date" at the top. Your continued use of
                  the Service after any such changes constitutes your acceptance of the new Terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  If you have any questions about these Terms of Use, please contact us:
                </p>
                <div className="text-white/90">
                  <p className="mb-2"><strong className="text-purple-400">Website:</strong> Cry808.com</p>
                  <p><strong className="text-purple-400">Email:</strong> network.sapient@gmail.com</p>
                </div>
              </div>
            </section>

            {/* Agreement */}
            <section className="mb-12">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                <p className="text-white/90 font-medium text-center">
                  By using Cry808, you acknowledge that you have read these Terms of Use and agree to be bound by them.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
