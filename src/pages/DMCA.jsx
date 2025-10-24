import React from "react";
import Footer from "../components/Footer";

export default function DMCA() {
  const contactEmail = "flushingtech.nyc@gmail.com";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              DMCA Policy
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <p className="text-white/70 mt-4">Digital Millennium Copyright Act Compliance</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 leading-relaxed mb-4">
                  Cry808 respects the intellectual property rights of others and expects its users to do the same.
                  In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), Title 17, United States Code,
                  Section 512, we will respond expeditiously to claims of copyright infringement committed using our website.
                </p>
                <p className="text-white/80 leading-relaxed">
                  We receive content from various outlets, record labels, artists, and producers. While we make reasonable
                  efforts to verify content authorization, we cannot guarantee that all submissions are authorized by the
                  copyright owner. If you believe that your copyrighted work has been copied in a way that constitutes
                  copyright infringement, please follow the notice procedure outlined below.
                </p>
              </div>
            </section>

            {/* Filing a DMCA Notice */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Filing a DMCA Copyright Infringement Notice</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  If you are a copyright owner, or authorized to act on behalf of one, please report alleged
                  copyright infringements by submitting a written notice with the following information:
                </p>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3 mt-1">1.</span>
                    <div>
                      <strong className="text-white">Identification of the copyrighted work:</strong>
                      <p className="mt-1">Identify the copyrighted work claimed to have been infringed. If multiple copyrighted works are covered by a single notification, provide a representative list of such works.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3 mt-1">2.</span>
                    <div>
                      <strong className="text-white">Identification of the infringing material:</strong>
                      <p className="mt-1">Provide sufficient information to permit Cry808 to locate the material on our website (e.g., the URL of the page containing the material).</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3 mt-1">3.</span>
                    <div>
                      <strong className="text-white">Contact information:</strong>
                      <p className="mt-1">Include your full name, mailing address, telephone number, and email address.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3 mt-1">4.</span>
                    <div>
                      <strong className="text-white">Good faith statement:</strong>
                      <p className="mt-1">Include the following statement: "I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3 mt-1">5.</span>
                    <div>
                      <strong className="text-white">Accuracy statement:</strong>
                      <p className="mt-1">Include the following statement: "The information in this notification is accurate, and under penalty of perjury, I am the owner, or authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed."</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3 mt-1">6.</span>
                    <div>
                      <strong className="text-white">Signature:</strong>
                      <p className="mt-1">Provide a physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Designated Agent */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Designated Copyright Agent</h2>
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  Send your DMCA notice to our designated copyright agent:
                </p>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-white/90">
                    <strong className="text-purple-400">Email:</strong> {contactEmail}
                  </p>
                  <p className="text-white/90 mt-2">
                    <strong className="text-purple-400">Subject Line:</strong> DMCA Takedown Request
                  </p>
                </div>
                <div className="mt-4 p-4 bg-pink-600/20 border border-pink-500/30 rounded-lg">
                  <p className="text-white/90 text-sm">
                    <strong>⚠️ Important:</strong> This email address is exclusively for copyright infringement claims.
                    All other inquiries will not receive a response.
                  </p>
                </div>
              </div>
            </section>

            {/* Counter-Notice */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Counter-Notification</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  If you believe that your content was removed or disabled by mistake or misidentification, you may
                  file a counter-notification with us. Your counter-notification must include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of the material that has been removed or disabled and its location before removal</li>
                  <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake or misidentification</li>
                  <li>Your name, address, telephone number, and a statement that you consent to the jurisdiction of Federal District Court</li>
                  <li>A statement that you will accept service of process from the person who provided the original DMCA notification</li>
                </ul>
              </div>
            </section>

            {/* Fair Use Notice */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Fair Use Consideration</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  Before submitting a DMCA notice, please consider whether the use of the copyrighted material may
                  qualify as fair use. Fair use is a legal doctrine that permits limited use of copyrighted material
                  without requiring permission from the rights holders. We recommend consulting the materials available
                  at the U.S. Copyright Office website (<a href="https://www.copyright.gov" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">www.copyright.gov</a>)
                  to help determine whether fair use or another exception to infringement applies.
                </p>
              </div>
            </section>

            {/* False Claims Warning */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Warning About False Claims</h2>
              <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-6">
                <p className="text-white/90 font-medium mb-3">
                  ⚠️ United States law imposes substantial penalties for falsely submitting a notice of copyright infringement.
                </p>
                <p className="text-white/80">
                  Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material
                  or activity is infringing may be subject to liability for damages. Don't make false claims!
                </p>
              </div>
            </section>

            {/* Repeat Infringers */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Repeat Infringer Policy</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  In accordance with the DMCA and other applicable law, Cry808 has adopted a policy of terminating,
                  in appropriate circumstances, users who are deemed to be repeat infringers. We may also, at our
                  sole discretion, limit access to our website and/or terminate the accounts of any users who infringe
                  any intellectual property rights of others.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                <p className="text-white/90">
                  If you have questions about this DMCA policy or copyright issues, please contact us at{" "}
                  <span className="text-purple-400 font-medium">{contactEmail}</span> with "DMCA Inquiry" in the subject line.
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
