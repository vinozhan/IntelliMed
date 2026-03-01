export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-blue-400">IntelliMed</h3>
            <p className="mt-2 text-gray-400">
              AI-Enabled Smart Healthcare Platform
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-gray-400">
              <li><a href="/doctors" className="hover:text-white">Find Doctors</a></li>
              <li><a href="/symptom-checker" className="hover:text-white">Symptom Checker</a></li>
              <li><a href="/register" className="hover:text-white">Register</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contact</h4>
            <p className="text-gray-400">support@intellimed.com</p>
            <p className="text-gray-400">+94 11 234 5678</p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          &copy; {new Date().getFullYear()} IntelliMed. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
