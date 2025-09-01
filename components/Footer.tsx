import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Sprachenwald</h3>
            <p className="text-gray-400">
              Naučite nemački jezik prirodno, korak po korak.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul>
              <li className="mb-2">
                <a href="#" className="hover:text-green-400">
                  Features
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-green-400">
                  Pricing
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-green-400">
                  Courses
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul>
              <li className="mb-2">
                <a href="#" className="hover:text-green-400">
                  About Us
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-green-400">
                  Careers
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-green-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul>
              <li className="mb-2">
                <a href="#" className="hover:text-green-400">
                  Privacy Policy
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-green-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Sprachenwald. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
