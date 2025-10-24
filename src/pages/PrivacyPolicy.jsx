import React from "react";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <p className="text-white/70 mt-4">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <p className="text-white/80 leading-relaxed">
                At Cry808, we value your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                you visit our website and subscribe to our newsletter.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">What Information Do We Collect?</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">We may collect the following information:</p>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li><strong className="text-white">Email Address:</strong> When you subscribe to our newsletter</li>
                  <li><strong className="text-white">Usage Data:</strong> Information about how you interact with our website</li>
                  <li><strong className="text-white">Cookies:</strong> Data stored on your device to enhance your browsing experience</li>
                  <li><strong className="text-white">Third-Party Analytics:</strong> We use services like Google Analytics to understand website traffic</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">How Do We Use Your Information?</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li>Send you our newsletter with the latest hip-hop news and exclusive interviews</li>
                  <li>Personalize your experience on our website</li>
                  <li>Improve our website based on user feedback and analytics</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Detect and prevent fraudulent activity</li>
                </ul>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Do We Use Cookies?</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  Yes. Cookies are small files that a site or its service provider transfers to your device's
                  hard drive through your web browser (if you allow) that enables the site's systems to recognize
                  your browser and capture and remember certain information.
                </p>
                <p className="text-white/80 mb-4">We use cookies to:</p>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li>Understand and save your preferences for future visits</li>
                  <li>Compile aggregate data about site traffic and interactions</li>
                  <li>Offer better site experiences and tools in the future</li>
                </ul>
                <p className="text-white/80 mt-4">
                  You can choose to have your computer warn you each time a cookie is being sent, or you can
                  choose to turn off all cookies through your browser settings.
                </p>
              </div>
            </section>

            {/* Third-Party Disclosure */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Do We Disclose Information to Third Parties?</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  We do not sell, trade, or otherwise transfer your personally identifiable information to third
                  parties. This does not include trusted third parties who assist us in operating our website,
                  conducting our business, or servicing you, as long as those parties agree to keep this information
                  confidential.
                </p>
                <p className="text-white/80 mb-4">We may share information with:</p>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li>Email service providers (for newsletter delivery)</li>
                  <li>Analytics providers (Google Analytics)</li>
                  <li>Advertising networks (Google AdSense)</li>
                </ul>
                <p className="text-white/80 mt-4">
                  We may also release your information when we believe it is appropriate to comply with the law,
                  enforce our site policies, or protect our or others' rights, property, or safety.
                </p>
              </div>
            </section>

            {/* Google AdSense */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Google AdSense</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  We use Google AdSense Advertising on our website. Google, as a third-party vendor, uses cookies
                  to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users
                  based on their visit to our site and other sites on the Internet.
                </p>
                <p className="text-white/80">
                  Users may opt out of the use of the DART cookie by visiting the Google ad and content network
                  privacy policy at: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">https://policies.google.com/privacy</a>
                </p>
              </div>
            </section>

            {/* COPPA */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Children's Online Privacy Protection Act (COPPA)</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  We do not specifically market to children under 13 years of age. If you are a parent or guardian
                  and believe that we have collected information from a child under 13, please contact us immediately
                  and we will delete such information from our records.
                </p>
              </div>
            </section>

            {/* California Privacy Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">California Privacy Rights (CCPA)</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  If you are a California resident, you have specific rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li>The right to know what personal information we collect and how we use it</li>
                  <li>The right to request deletion of your personal information</li>
                  <li>The right to opt-out of the sale of your personal information (we do not sell personal information)</li>
                  <li>The right to non-discrimination for exercising your privacy rights</li>
                </ul>
              </div>
            </section>

            {/* Newsletter Unsubscribe */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">How to Unsubscribe from Our Newsletter</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  You can unsubscribe from our newsletter at any time by clicking the "Unsubscribe" link at the
                  bottom of any email we send you. If you have any issues unsubscribing, please contact us directly.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">How We Protect Your Information</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  We implement a variety of security measures to maintain the safety of your personal information.
                  However, no method of transmission over the Internet or electronic storage is 100% secure, so we
                  cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                  the new Privacy Policy on this page and updating the "Last Updated" date at the top of this policy.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-white/80 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="text-white/70">
                  <p className="mb-2"><strong className="text-white">Website:</strong> Cry808.com</p>
                  <p><strong className="text-white">Email:</strong> network.sapient@gmail.com</p>
                </div>
              </div>
            </section>

            {/* Consent */}
            <section className="mb-12">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                <p className="text-white/90 font-medium">
                  By using our website, you consent to our Privacy Policy and agree to its terms.
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
